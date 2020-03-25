#!/usr/bin/env python
import numpy as np
import matplotlib.pyplot as plt
import math
from abc import ABCMeta, abstractmethod
from prettytable import PrettyTable

X_VECTORS = [
    [0,0,0,0],
    [0,0,0,1],
    [0,0,1,0],
    [0,0,1,1],
    [0,1,0,0],
    [0,1,0,1],
    [0,1,1,0],
    [0,1,1,1],
    [1,0,0,0],
    [1,0,0,1],
    [1,0,1,0],
    [1,0,1,1],
    [1,1,0,0],
    [1,1,0,1],
    [1,1,1,0],
    [1,1,1,1]
    ]

# Абстрактный класс функции
class Func():
    __metaclass__ = ABCMeta
 
    @abstractmethod
    def compute(self, income: float):
        """Значение функции активации"""
    
    @abstractmethod
    def derivative(self, income: float):
        """Производная функции"""    

    @abstractmethod
    def get_id(self):
        """ИД  функции"""
 
# Пороговая функуия активации
class Threshold(Func):

    def compute(self, income: float):
        if income >= 0:
            return 1.
        return 0.
 
    def derivative(self, income: float):
        return 1.

    def get_id(self):
        return 1    
    
assert issubclass(Threshold, Func)
assert isinstance(Threshold(), Func)

# Пороговая функуия активации
class Gauss(Func):

    def compute(self, income: list, center: list):
        error_vector = (np.array(income) - np.array(center)) ** 2
        return math.exp(-error_vector.sum())
 
    def derivative(self, income: float):
        return 1.

    def get_id(self):
        return 2    
    
assert issubclass(Gauss, Func)
assert isinstance(Gauss(), Func)

# Класс нейрона
class Neuron:
    def __init__(self, count: int, function: Func, bias=1.):
        # self.weights = np.random.rand(count + 1)
        self.weights = np.zeros(count + 1)
        self.f = function # функция активации
        self.bias = bias  # смещение
        self.output = 0.   # выход нейрона

    def compute_net(self, inputs: list):
        assert len(self.weights) == len(inputs) + 1
        # net = Sum Wi*Xi
        return np.dot(self.weights[1:], inputs) + self.bias * self.weights[0]

    # Рассчитать нейрон
    def compute_out(self, inputs: list):
        assert len(self.weights) == len(inputs) + 1

        net = self.compute_net(inputs)
        self.output = self.f.compute(net)
        return self.output
 
    # Корректировка весов согласно правилу Видроу-Хоффа (дельта-правило)
    def correct_weigts(self, learning_rate: float, local_error: float, inputs: list):
        assert learning_rate > 0. and learning_rate <= 1.
        # Wi = Wi + n*d*Xi*(f'(net))
        net = self.compute_net(inputs)
        self.weights += np.append([self.bias], inputs) * \
            (learning_rate * local_error * self.f.derivative(net))
    
    def get_weigts(self):
        return self.weights

# Класс нейрона
class RBFNeuron(Neuron):
    def __init__(self, function: Func, center: list):
        Neuron.__init__(self, -1, function, 0)
        self.weights = center
      
    def compute_net(self, inputs: list):
        assert len(self.weights) == len(inputs)
        return self.f.compute(inputs, self.weights)


    # Рассчитать нейрон
    def compute_out(self, inputs: list):
        assert len(self.weights) == len(inputs)

        self.output = self.compute_net(inputs)
        return self.output
 
    # NOT IMPLEMENTED
    def correct_weigts(self, learning_rate: float, local_error: float, inputs: list):
        return

    def get_weigts(self):
        return self.weights[1:]


def boolean_function(x: list):
    assert len(x) == 4

    return (not (x[0] and x[1])) and x[2] and x[3]  # из методы

def get_J():
    J0 = []; J1 = []
    for X in X_VECTORS:
        if boolean_function(X): J1.append(X)
        else: J0.append(X)

    if len(J0) > len(J1): return J1
    else: return J0

class RBFLayer:
    def __init__(self, centers: list):
        self.size = len(centers)
        self.__neurons = [ RBFNeuron(Gauss(), center) for center in centers]
        print(self.__neurons)
        
    def compute_out(self, inputs: list):
        return [ neuron.compute_out(inputs) for neuron in self.__neurons]


def compute_real_function(sets: list):
    return [boolean_function(X) for X in sets]

def compute_image_function(sets: list, n: Neuron, rbf: RBFLayer):
    return [n.compute_out(rbf.compute_out(X)) for X in sets]

def compute_total_error(real: list, image: list):
    assert len(real) == len(image)
    return ((np.array(real) - np.array(image)) ** 2).sum()


def learn_on_sets(sets: list, learning_rate: float, n: Neuron, rbf: RBFLayer):
    for X in sets:
        t = boolean_function(X)
        rbf_out = rbf.compute_out(X)
        y = n.compute_out(rbf_out)
        error = t - y
        if error != 0:
            n.correct_weigts(learning_rate, error, rbf_out)

def learning(sets: list, learning_rate: float):
    rbf_layer = RBFLayer(get_J())
    neuron = Neuron(rbf_layer.size, Threshold())
    table = PrettyTable(['Эпоха', 'Синаптические веса', \
        'Выходная функция', 'Суммарная ошибка'])

    total_error = 1; era = 0
    while total_error != 0:
        if era > 100: table.clear(); break

        real = compute_real_function(sets)
        image = compute_image_function(sets, neuron, rbf_layer)
        total_error = compute_total_error(real, image)

        table.add_row([era, neuron.weights, image, total_error])

        if total_error != 0:
            learn_on_sets(sets, learning_rate, neuron, rbf_layer)
        
        era += 1
    return table


if __name__ == "__main__":
   results = learning([[0,0,0,1],[0,1,1,1],[1,0,1,0],[1,0,1,1],[1,1,1,0]],0.3)
   print(results)
    # print(r)
    # print(n1.compute([r]))


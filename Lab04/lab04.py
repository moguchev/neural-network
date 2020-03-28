#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import numpy as np
import math
import matplotlib.pyplot as plt
from abc import ABCMeta, abstractmethod
from prettytable import PrettyTable
from itertools import combinations


def line_plot(x_data, y_data, x_label="", y_label="", title=""):
    _, ax = plt.subplots()
    ax.plot(x_data, y_data, lw=2, marker='o', color='#539caf', alpha=0.8)
    ax.set_title(title)
    ax.set_xlabel(x_label)
    ax.set_ylabel(y_label)
    plt.grid()
    plt.show()

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

# Функуия активации
class ActivationFunc(Func):

    def compute(self, income: float):
        return (1 - math.exp(-income)) / (1 + math.exp(-income))
 
    def derivative(self, income: float):
        f = self.compute(income)
        return (1 - f ** 2) / 2

    def get_id(self):
        return 1    
    
assert issubclass(ActivationFunc, Func)
assert isinstance(ActivationFunc(), Func)

# Класс нейрона
class Neuron:
    def __init__(self, count: int, function: Func, bias=1.):
        # self.weights = np.random.rand(count + 1) - 0.5
        self.weights = np.zeros(count + 1)
        self.f = function # функция активации
        self.bias = bias  # смещение
        self.output = 0.  # выход нейрона
        self.net = 0.     # net

    def compute_net(self, inputs: list):
        assert len(self.weights) == len(inputs) + 1
        # net = Sum Wi*Xi
        self.net = np.dot(self.weights[1:], inputs) + self.bias * self.weights[0]
        return self.net
    
    def compute_derivative_net(self):
        return self.f.derivative(self.net)

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


class Layer:
    def __init__(self, size: int, num_of_weigts: int, function: Func):
        self.num_of_weigts = num_of_weigts
        self.__neurons__ = [Neuron(num_of_weigts, function) for _ in range(size)]

    def compute_out(self, inputs: list):
        out = [neuron.compute_out(inputs) for neuron in self.__neurons__]
        return out

    def correct_weigts(self, learning_rate: float, inputs: list, local_errors: list):
        assert len(local_errors) == len(self.__neurons__)

        for i in range(len(self.__neurons__)):
            self.__neurons__[i].correct_weigts(learning_rate, local_errors[i], inputs)
    
    def get_weights(self):
        return [ list(neuron.weights) for neuron in self.__neurons__]

class HiddenLayer(Layer):
    def __init__(self, size: int, num_of_weigts: int, function: Func):
        Layer.__init__(self, size, num_of_weigts, function)


class OutputLayer(Layer):
    def __init__(self, size: int, num_of_weigts: int, function: Func):
        Layer.__init__(self, size, num_of_weigts, function)

    def compute_error(self, inputs: list, real: list):
        image = self.compute_out(inputs)
        local_error = np.array(real) - np.array(image)
        deritive = np.array([n.compute_derivative_net() for n in self.__neurons__])
        return deritive * local_error

    def compute_back_error(self, inputs: list, real: list):
        output_error = self.compute_error(inputs, real)
        back_error = np.zeros(self.num_of_weigts)
        for i in range(len(self.__neurons__)):
            w = self.__neurons__[i].weights[1:]
            tmp = np.array(w) * output_error[i]
            back_error += (tmp)
        return back_error

def compute_total_error(real: list, image: list):
    assert len(real) == len(image)
    return math.sqrt(((np.array(real) - np.array(image)) ** 2).sum())

def back_propogation_learning(N: int, J: int, M: int, X: list, T: list, learning_rate: float, E: float):
    hidden_layer = HiddenLayer(J, N, ActivationFunc())
    output_layer = OutputLayer(M, J, ActivationFunc())

    table = PrettyTable(['Номер эпохи', 'Скрытый слой','Входной слой', 'Выходной вектор', 'Сумарная ошибка'])
    total_errors = []
    total_error = 1.
    era = 0
    while total_error > E:
        if era >1000: break

        out1 = hidden_layer.compute_out(X)
        out2 = output_layer.compute_out(out1)
        total_error = compute_total_error(T, out2)

        total_errors.append(total_error)
        table.add_row([era, hidden_layer.get_weights(), output_layer.get_weights(), out2, total_error])
        print(era, out2, total_error)

        if total_error > 0.001:
            e2 = np.array(T) - np.array(out2)
            e1 = output_layer.compute_back_error(out1, T)
            output_layer.correct_weigts(learning_rate, out1, e2)
            hidden_layer.correct_weigts(learning_rate, X, e1)
        
        era += 1

    return table, total_errors

if __name__ == '__main__':
    # МЕТОДА
    # N = 3
    # J = 3
    # M = 4
    # X = [0.3,-0.1,0.9]
    # T = [0.1, -0.6, 0.2, 0.7]
    # n = 1.
    # accuracy = 0.001
    # 7
    N = 1
    J = 2
    M = 1
    X = [4.]
    T = [-0.2]
    n = 0.5
    accuracy = 0.001

    results, errors = back_propogation_learning(N,J,M,X,T,n, accuracy)
    print(results)
    line_plot([i for i in range(len(errors))], errors, 'Номер эпохи, k', 'Сумарная ошибка, E', 'E(k)')
    

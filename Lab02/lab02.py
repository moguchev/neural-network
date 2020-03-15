import numpy as np
import matplotlib.pyplot as plt

from abc import ABCMeta, abstractmethod

from prettytable import PrettyTable
from itertools import zip_longest
 
def line_plot(x_data, y_data, x_value, y_value, x_label="", y_label="", title=""):
    '''
    Функция для построения графика
    '''
    # Create the plot object
    _, ax = plt.subplots()

    # Plot the best fit line, set the linewidth (lw), color and
    # transparency (alpha) of the line
    ax.plot(x_data, y_data, lw=2, color='#539caf', alpha=0.5)
    # Plot the data, set the size (s), color and transparency (alpha)
    # of the points
    ax.scatter(x_data[:(len(x_data) // 2 + 1)],
                y_data[:(len(y_data) // 2 + 1)],
                marker='o', s=10, c='b', alpha=0.3)
    ax.scatter(x_value, y_value, marker='o', s=15, c='r', alpha=0.6)

    # Label the axes and provide a title
    ax.set_title(title)
    ax.set_xlabel(x_label)
    ax.set_ylabel(y_label)
    plt.grid()
    plt.show()


# Абстрактный класс функции
class Func():
    __metaclass__ = ABCMeta
 
    @abstractmethod
    def compute(self,income):
        """Значение функции активации"""
    
    @abstractmethod
    def derivative(self, income):
        """Производная функции"""    

    @abstractmethod
    def get_id():
        """ИД  функции"""
 

# Линейная функуия активации f(net) = net
class AsIs(Func):
 
    def compute(self,income):
        return income
 
    def derivative(self, income):
        return 1

    def get_id(self):
        return 1    
    
assert issubclass(AsIs, Func)
assert isinstance(AsIs(), Func)

# Класс нейрона
class Neuron:
    def __init__(self, count: int, function: Func, bias = 1.):
        self.weights = np.random.rand(count + 1)
        self.f = function # функция активации
        self.bias = bias  # смещение
        self.output = 0   # выход нейрона

    # Рассчитать нейрон
    def compute(self, inputs :list):
        assert len(self.weights) == len(inputs) + 1
        # net = Sum Wi*Xi
        net = np.dot(self.weights[1:], inputs) + self.bias * self.weights[0]
        self.output = self.f.compute(net)
        return self.output
 
    # Корректировка весов согласно правилу Видроу-Хоффа (дельта-правило)
    def correct_weigts(self, learning_rate: float, local_error: float, inputs: list):
        assert learning_rate > 0 & learning_rate <= 1
        # Wi = Wi + n * d * Xi
        self.weights += np.append([self.bias], inputs) * (learning_rate * local_error)


def generate_time_points(a :float, b :float, count :int):
    # step = float((np.abs(a) + np.abs(b)) / (count - 1))
    # return [round(float(i), 3) for i in np.arange(a, b + step, step)]
    return list(np.linspace(a, b, count))

# Прогнозируемая временная функция
def function(t :float):
    return 0.5 * np.sin(0.5 * t) - 0.5


def neuron_training(neuron: Neuron, learning_set: list, era_count: int, learning_rate: float):
    window_size = len(neuron.weights) - 1
    for _ in range(era_count):
        last_index = len(learning_set) - window_size - 1
        for i in range(last_index):
            window = learning_set[i:i + window_size]
            next_x = neuron.compute(window)
            local_error = learning_set[i + window_size] - next_x
            neuron.correct_weigts(learning_rate, local_error, window)


def get_forecast(neuron: Neuron, last_values: list, points: list):
    window_size = len(neuron.weights) - 1
    values = last_values[:]
    for i in range(len(points)):
        window =  values[i:i + window_size]
        values.append(neuron.compute(window))

    return values[window_size:]

if __name__ == "__main__":
    a = -2            # левая граница обучающего интервала t
    b = 4             # правая граница обучающего интервала t
    c = 2 * b - a     # правая граница прогнозируемого интервала t
    window_size = 6   # размер окна
    learning_rate = 1 # норма обучения
    N = 20

    # точки на интервале [a,c]
    points = generate_time_points(a, c, 2 * N)
    # значения прогнозируемой функции на точках из интервала [a,c]
    real_values = [function(t) for t in points]

    # точки на интервале [a,b]
    learning_points = points[:N]
    # значения прогнозируемой функции на точках из интервала [a,b]
    learning_values = [function(t) for t in learning_points]

    neuron = Neuron(window_size, AsIs())
    neuron_training(neuron, learning_values, 4000, learning_rate)

    # точки на интервале (b, c]
    predicted_points = points[N:]
    # 
    last_values = learning_values[N-window_size:]
    predicted_values = get_forecast(neuron, last_values, predicted_points)
    
    line_plot(points, real_values, predicted_points, predicted_values, 'x', 'X(t)', 'График [a, 2b - a]')
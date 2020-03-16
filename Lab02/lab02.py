import numpy as np
import matplotlib.pyplot as plt


from abc import ABCMeta, abstractmethod
from prettytable import PrettyTable

def print_progress_bar(iteration, total, prefix='', suffix='', decimals=1, length=100, fill='█'):
    """
    Call in a loop to create terminal progress bar
    @params:
        iteration   - Required  : current iteration (Int)
        total       - Required  : total iterations (Int)
        prefix      - Optional  : prefix string (Str)
        suffix      - Optional  : suffix string (Str)
        decimals    - Optional  : positive number of decimals in percent complete (Int)
        length      - Optional  : character length of bar (Int)
        fill        - Optional  : bar fill character (Str)
    """
    percent = ("{0:." + str(decimals) + "f}").format(100 * (iteration / float(total)))
    filled_length = int(length * iteration // total)
    bar = fill * filled_length + '-' * (length - filled_length)
    print('\r%s |%s| %s%% %s' % (prefix, bar, percent, suffix), end = '\r')

    if iteration == total:
        print()


def line_plot(x_data, y_data, x_value, y_value, x_label="", y_label="", title=""):
    '''
    Функция для построения графика
    '''
    _, ax = plt.subplots()
    # function
    ax.plot(x_data, y_data, lw = 2, color = '#539caf', alpha = 0.5)
    # discrete values of the function
    ax.scatter(x_data[:(len(x_data) // 2 + 1)],
               y_data[:(len(y_data) // 2 + 1)],
               marker='o', s=15, c='g', alpha=0.6)
    # discrete values of the function          
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
    def get_id(self):
        """ИД  функции"""
 
# Линейная функуия активации f(net) = net
class AsIs(Func):
 
    def compute(self, income):
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
        assert learning_rate > 0. and learning_rate <= 1.
        # Wi = Wi + n*d*Xi
        self.weights += np.append([self.bias], inputs) * (learning_rate * local_error)


def generate_time_points(a :float, b :float, count :int):
    return list(np.linspace(a, b, count))

# Прогнозируемая временная функция
def function(t :float):
    # return t ** 4 - 2 * (t ** 3) + t
    # return 0.5 * np.sin(0.5 * t) - 0.5
    return 0.4 * np.sin(0.3 * t) + 0.5

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

def compute_total_standard_error(real: list, received: list):
    assert len(real) == len(received)

    error_vector = (np.array(real) - np.array(received)) ** 2
    return np.sqrt(error_vector.sum())

def research(points: list, real_values: list, N: int):
    ptb = PrettyTable()
    ptb.field_names = ['Количество эпох','Размер окна','Норма обучения', 'Суммарная ошибка']

    i = 0
    print_progress_bar(i, 19*20*6, prefix='Research:', suffix='Complete', length=50)
    for M in range(20000, 1000, -1000):
        for ws in range(2, 9, 1):
            lr = 0.05
            while lr <= 1:
                neuron = Neuron(ws, AsIs())
                neuron_training(neuron, real_values[:N], M, lr)
                predicted_values = get_forecast(neuron, real_values[N-ws:N], points[N:])
                E = compute_total_standard_error(real_values[N:], predicted_values)
                
                ptb.add_row([M, ws, lr, round(E,4)])

                lr += 0.05
                i += 1
                print_progress_bar(i, 19*20*6, prefix='Research:', suffix='Complete', length=50)
    print_progress_bar(i, 19*20*6, prefix='Research:', suffix='Complete', length=50)

    print(ptb)




if __name__ == "__main__":
    a = -4              # левая граница обучающего интервала t
    b = 4               # правая граница обучающего интервала t
    c = 2 * b - a       # правая граница прогнозируемого интервала t
    N = 20              # количесвто точек равномерно расположенных на [a,b]

    window_size = int(input('Введите длину скользящего окна: '))
    learning_rate = float(input('Введите норму обучения: '))
    number_of_eras = int(input('Введите колличество эпох обучения: '))

    # точки на интервале [a,c]
    points = generate_time_points(a, c, 2 * N)
    # значения прогнозируемой функции на точках из интервала [a,c]
    real_values = [function(t) for t in points]
    # точки на интервале [a,b]
    learning_points = points[:N]
    # значения прогнозируемой функции на точках из интервала [a,b]
    learning_values = real_values[:N]

    neuron = Neuron(window_size, AsIs())
    neuron_training(neuron, learning_values, number_of_eras, learning_rate)

    # точки на интервале (b, c = 2b-a]
    predicted_points = points[N:]
    # значения последнего окна обучения по которым начнется прогноз
    last_values = learning_values[N-window_size:]
    # прогнозируемые значения
    predicted_values = get_forecast(neuron, last_values, predicted_points)

    E = compute_total_standard_error(real_values[N:], predicted_values)

    title = 'Размер окна: ' + str(window_size) + ' Норма обучения: ' + str(learning_rate)
    title += '\nКоличество эпох: ' + str(number_of_eras) + ' Среднеквадратичная ошибка: ' + str(round(E, 4))
    line_plot(points, real_values, predicted_points, predicted_values, 'x', 'X(t)', title)

    research(points, real_values, N)
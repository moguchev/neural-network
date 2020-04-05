#!/usr/bin/python3
# -*- coding: utf-8 -*-
import numpy as np

class HopfildNetwork:
    """
    НС Хопфилда
    """

    def __init__(self, activation_func, len_vector: int):
        """
        Конструктор класса
        :param len_vector: Размер вектора входных "изображений"
        :param f: Функция активации
        """
        self.len = len_vector
        self.f = activation_func
        self.weight_matrix = np.zeros((len_vector,len_vector), dtype=int)

    def reset(self):
         self.weight_matrix = np.zeros((self.len, self.len), dtype=int)

    def remember(self, img1: list, img2: list, img3: list):
        """
        Запоминание образов.
        Формируется матрица весов по заданным образам для запоминания.
        """
        for i in range(self.len):
            for j in range(self.len):
                if i == j: 
                    self.weight_matrix[i][j] = 0
                else:
                    self.weight_matrix[i][j] = img1[i] * img1[j] + \
                        img2[i] * img2[j] + img3[i] * img3[j]
               
        print(self.weight_matrix)

    def recognize(self, input_signal: list):
        """
        Распознавание
        :param input_signal: входной вектор
        """
        y = np.zeros((self.len, self.len), dtype=int)
        
        while not (np.array_equal(y, input_signal)):
            y = input_signal

            for k in range(self.len):
                # Считаем комбинированный вход в асинхронном режиме
                net = sum([self.weight_matrix[j][k] * input_signal[j] for j in range(k - 1)]) + \
                      sum([self.weight_matrix[j][k] * y[j] for j in range(k + 1, self.len)])

                input_signal[k] = self.f(net, y[k])

        return input_signal
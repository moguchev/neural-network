#!/usr/bin/python3
# -*- coding: utf-8 -*-

from tkinter import *
from hopfild_network import HopfildNetwork


def f_a(net, y):
    """
    Функция активации
    :param net: комбинационный вход
    """
    if net > 0: return 1
    elif net < 0: return -1
    else: return y


def remember(event):
    """
    Запоминание образов.
    """
    image1 = []; image2 = []; image3 = []

    for i in range(len_vector):
        image1.append(c1[i].get())
        image2.append(c2[i].get())
        image3.append(c3[i].get())
        if image1[i] == 0: image1[i] = -1
        if image2[i] == 0: image2[i] = -1
        if image3[i] == 0: image3[i] = -1

    network.remember(image1, image2, image3)


def result(event):
    """
    Функция запуска вычисления результата распознавания
    """

    # Считывание искаженного значения
    input1 = []; input2 = []; input3 = []

    for i in range(len_vector):
        input1.append(c1[i].get())
        input2.append(c2[i].get())
        input3.append(c3[i].get())

        if input1[i] == 0: input1[i] = -1
        if input2[i] == 0: input2[i] = -1
        if input3[i] == 0: input3[i] = -1

    # Распознавание
    output1 = network.recognize(input1)
    output2 = network.recognize(input2)
    output3 = network.recognize(input3)

    # Помещаем полученные вектора в таблицу для отображения
    for i in range(len_vector):
        if output1[i] == 1: check_b1[i].select()
        else: check_b1[i].deselect()
        if output2[i] == 1: check_b2[i].select()
        else: check_b2[i].deselect()
        if output3[i] == 1: check_b3[i].select()
        else: check_b3[i].deselect()


def reset(event):
    """
    Функция сброса образов для запоминания.
    """
    network.reset()
    for i in range(len_vector):
        check_b1[i].deselect()
        check_b2[i].deselect()
        check_b3[i].deselect()
    


if __name__ == '__main__':
    root = Tk()
    root.title('Распознавание образов')

    frame1 = Frame(root)
    frame2 = Frame(root)
    frame3 = Frame(root)
    frame4 = Frame(root)
    frame5 = Frame(root)
    frame6 = Frame(root)
    frame7 = Frame(root)
    frame1.grid(row=0, column=0, padx=15, pady=12)
    frame2.grid(row=0, column=1, padx=15, pady=12)
    frame3.grid(row=0, column=2, padx=15, pady=12)
    frame4.grid(row=1, column=0)
    frame5.grid(row=1, column=1)
    frame6.grid(row=1, column=2)

    # Длина вектора для хранения одной буквы
    len_vector = 28

    c1 = [IntVar() for _ in range(len_vector)]
    c2 = [IntVar() for _ in range(len_vector)]
    c3 = [IntVar() for _ in range(len_vector)]

    check_b1 = []; check_b2 = []; check_b3 = []

    n = 0
    for i in range(4):
        for j in range(7):
            check_b1.append(Checkbutton(frame1, bd=5, variable=c1[n], offvalue=-1))
            check_b1[-1].grid(row=j, column=i)
            n += 1

    n = 0
    for i in range(4):
        for j in range(7):
            check_b2.append(Checkbutton(frame2, bd=5, variable=c2[n], offvalue=-1))
            check_b2[-1].grid(row=j, column=i)
            n += 1

    n = 0
    for i in range(4):
        for j in range(7):
            check_b3.append(Checkbutton(frame3, bd=5, variable=c3[n], offvalue=-1))
            check_b3[-1].grid(row=j, column=i)
            n += 1

    w = []
    network = HopfildNetwork(f_a, len_vector)

    button_remember = Button(frame4, text='Запомнить', width=10, height=1)
    button_remember.grid(padx=10, pady=10)
    button_remember.bind('<Button-1>', remember)

    button_result = Button(frame5, text='Результат', width=10, height=1)
    button_result.grid(padx=10, pady=10)
    button_result.bind('<Button-1>', result)

    button_reset = Button(frame6, text='Сброс', width=10, height=1)
    button_reset.grid(padx=10, pady=10)
    button_reset.bind('<Button-1>', reset)

    root.geometry('500x300')
    root.resizable(width=FALSE, height=FALSE)
    root.mainloop()

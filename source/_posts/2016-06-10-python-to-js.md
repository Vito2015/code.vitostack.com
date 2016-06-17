---
title: python、js代码转化工具
date: 2016-06-10 10:52:43
categories: Python
tags: [python,javascript]
description:
---
>    Python还是Javascript？我们经常会争论哪种语言更有前途。相比之下，哪种语言在浏览器中更好用则没有什么争论，因为那必然是Javascript。

>    嗯～也许并不是没有争论。Javascript经常被用作其他语言转化的目标语言。由于Python拥有庞大的追随群体，和大量已经存在的库，使得“编写Python，然后转化成javascript代码”很受期待。

>    下面是4个能够将Python转化为Javascript的工具，其中一个抢眼，因为它还能反过来把Javascript转化为Python。

<!--more-->
##  Transcrypt

一个新出现的Python到Javascript编译器。它做了一些有关于它生成的代码质量方面的有趣承诺。首先，它尽量保留原始Python代码的结构，包括多继承和lambda函数等的特性。此外，Python代码也能调用Javascript命名空间中的对象。如果你在Python中试着调用document.getElementById，那么生成的javascript中就会如实地使用getElementById。

根据文档，Transcrypt是使用Python的AST模块来实现这些功能的。AST模块允许开发者调用Python解析自己代码的功能。虽然这个项目还是alpha版，但是看着它一点点成长还是很令人激动。

##  Jiphy

Jiphy，这个单词的意思是“Javascript in, Python out”，反向同样可以做转换。另外，在任何方向的转化之前，两种语言的代码都可以先进行杂揉。

Jiphy目前最大的弱点是它只支持Python语言特性的一个子集。它不支持类和函数的默认参数，尽管它已经支持了装饰器和异常。有这样的缺陷主要是因为Jiphy坚持在源代码和目标代码之间建立行级的对应关系。它的开发者正在ES6的新特性里寻找，看如何更好地支持Python的其他特性。

## Brython

某一天，当WebAssembly变为现实，开发者也许就可以选择任何自己喜欢的编程语言来编写Web应用了。Brython的哲学就是，尽量和Python3一样快：还等什么？

Brython用Javascript实现了一个Web客户端版本的Python3。它使用Javascirpt模拟了Python3的所有关键字，并模拟了大多数的内置函数。Brython脚本能够让你直接在浏览器中编写Python3，它还提供了高级的Python模块让你能够在浏览器中进行DOM操作，就跟Javascript做的一模一样。

但是，Brython同样保留了Javascript的限制----例如，处理不了本地的文件系统。

##  RapydScript

RapydScript认为“Pythonic的Javascript才是正途”。这个项目在概念上很像CoffeScript：以近似Python的形式编写代码，然后转化成Javascript，汲取两个语言的精华。对于Python，吸取它符号简洁的特点；对于Javascript，采用它的匿名函数、管理DOM的功能和扩展现有Javascript库的能力。
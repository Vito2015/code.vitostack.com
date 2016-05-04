---
title: 介绍一个python扩展库-pyextend lib
date: 2016-05-04 22:05:31
categories: Python
tags: [python, pyextend]
description: 
---

## 概述
python 扩展库 [pyextend](https://github.com/Vito2015/pyextend)
pyextend 是 [Vito](http://www.vitostack.com/) 整理的比较有用的 python 扩展包，Github 地址 [https://github.com/Vito2015/pyextend](https://github.com/Vito2015/pyextend)，欢迎fork 欢迎 Pull Request，一起丰富。
[pyextend](https://github.com/Vito2015/pyextend) 支持 py2 和 py3 项目已经发布到 **[pypi](https://pypi.python.org/pypi/pyextend)** ,截止发稿日期已经是 _0.1.24_ 版本
### 安装方式： 
``pip install pyextend``

## accepts函数参数检查

``accepts(exception=TypeError, **types)``
> 参数:
> ``exception``: 检查失败时的抛出异常类型
> ``**types``: 待检查的k-v参数
> ``**types``参数支持
> ``a=int`` : 待测函数参数 ``a`` 必须为 ``int`` 类型, 否则检查失败
> ``b='__iter__'`` : 待测参数 ``b`` 必须为 实现 ``__iter__`` 函数的 ``iterable`` 类型
> ``c=('__iter__', None)`` : 待测参数 ``c`` 必须为实现 ``__iter__``函数的 ``iterable``类型或者 ``None``.
<!--more-->
### e.g
```python
Example 1:
        @accepts(a=int, b='__iter__', c=str)
        def test(a, b=None, c=None):
            print('accepts OK')

        test(13, b=[], c='abc')  -- OK
        test('aaa', b=(), c='abc') --Failed

    Example 2:
        @accepts(a=int, b=('__iter__', None), c=str)
        def test(a, b=None, c=None):
            print('accepts OK')

        test(13, b=[], c='abc')  -- OK
        test(13, b=None, c='abc')  -- OK
```
### source code
```python
def accepts(exception=TypeError, **types):
    """
    A wrapper of function for checking function parameters type
    """

    def check_param(v, type_or_funcname):
        if isinstance(type_or_funcname, tuple):
            results1 = [check_param(v, t) for t in type_or_funcname if t is not None]
            results2 = [v == t for t in type_or_funcname if t is None]
            return any(results1) or any(results2)

        is_type_instance, is_func_like = False, False
        try:
            is_type_instance = isinstance(v, type_or_funcname)
        except TypeError:
            pass
        if isinstance(type_or_funcname, str):
            if type_or_funcname == '__iter__' and isinstance(v, str) and version_info < (3,):
                # at py 2.x, str object has non `__iter__` attribute,
                # str object can use like `for c in s`, bcz `iter(s)` returns an iterable object.
                is_func_like = True
            else:
                is_func_like = hasattr(v, type_or_funcname)

        return is_type_instance or is_func_like

    def check_accepts(f):
        assert len(types) <= f.__code__.co_argcount,\
            'accept number of arguments not equal with function number of arguments in "{}"'.format(f.__name__)

        @functools.wraps(f)
        def new_f(*args, **kwargs):
            for i, v in enumerate(args):
                if f.__code__.co_varnames[i] in types and \
                        not check_param(v, types[f.__code__.co_varnames[i]]):
                    raise exception("function '%s' arg '%s'=%r does not match %s" %
                                    (f.__name__, f.__code__.co_varnames[i], v, types[f.__code__.co_varnames[i]]))
                    del types[f.__code__.co_varnames[i]]

            for k, v in kwargs.items():
                if k in types and \
                        not check_param(v, types[k]):
                    raise exception("function '%s' arg '%s'=%r does not match %s" % (f.__name__, k, v, types[k]))
            return f(*args, **kwargs)
        return new_f
    return check_accepts
```


## unpack 列表集合字符串解包函数

``unpack (iterable, count, fill=None)``

> 参数:
> ``iterable``: 实现 ``__iter__``的可迭代对象, 如 ``str``, ``tuple``, ``dict``, ``list``
> ``count``:    需要拆分的数量, 如数值大于 ``len(iterable)`` 则使用 ``fill`` 的值进行后续填充
> ``fill``:          默认值填充

### e.g：
```python
Example 1:
        In[1]: source = 'abc'
        In[2]: a, b = unpack(source, 2)
        In[3]: print(a, b)
        a b

Example 2:
        In[1]: source = 'abc'
        In[2]: a, b, c, d = unpack(source, 4)
        In[3]: print(a, b, c, d)
        a b None None
```
### source code

```python
@accepts(iterable='__iter__', count=int)
def unpack(iterable, count, fill=None):
    """
    The iter data unpack function.

    """
    iterable = list(enumerate(iterable))
    cnt = count if count <= len(iterable) else len(iterable)
    results = [iterable[i][1] for i in range(cnt)]

    # results[len(results):len(results)] = [fill for i in range(count-cnt)]
    results = merge(results, [fill for i in range(count-cnt)])
    return tuple(results)
```

## merge可迭代对象合并函数

``merge (iterable1, *args)``

> 参数: 
> ``iterable1``: 实现 ``__iter__``的可迭代对象, 如 ``str``, ``tuple``, ``dict``, ``list``
> ``*args``: 其他实现 ``__iter__``的可迭代对象
> 返回值: 合并后的迭代对象

### e.g
```python
Example 1:
        source = ['a', 'b', 'c']
        result = merge(source, [1, 2, 3])
        self.assertEqual(result, ['a', 'b', 'c', 1, 2, 3])

        result = merge(source, [1, 2, 3], ['x', 'y', 'z'])
        self.assertEqual(result, ['a', 'b', 'c', 1, 2, 3, 'x', 'y', 'z'])

    Example 2:
        source = 'abc'
        result = merge(source, '123')
        self.assertEqual(result, 'abc123')

        result = merge(source, '123', 'xyz')
        self.assertEqual(result, 'abc123xyz')

    Example 3:
        source = ('a', 'b', 'c')
        result = merge(source, (1, 2, 3))
        self.assertEqual(result, ('a', 'b', 'c', 1, 2, 3))

        result = merge(source, (1, 2, 3), ('x', 'y', 'z'))
        self.assertEqual(result, ('a', 'b', 'c', 1, 2, 3, 'x', 'y', 'z'))

    Example 4:
        source = {'a': 1, 'b': 2, 'c': 3}
        result = merge(source, {'x': 'm', 'y': 'n'}, {'z': '1'})
        self.assertEqual(result, {'a': 1, 'b': 2, 'c': 3, 'x': 'm', 'y': 'n', 'z': '1'})
```
## source code
```python
@accepts(iterable1='__iter__')
def merge(iterable1, *args):
    """
    Returns an type of iterable1 value, which merged after iterable1 used *args

    :exception TypeError: if any parameter type of args not equals type(iterable1)

    """

    result_list = list(iterable1) if not isinstance(iterable1, dict) else eval('list(iterable1.items())')

    for i, other in enumerate(args, start=1):
        if not isinstance(other, type(iterable1)):
            raise TypeError('the parameter type of index {} not equals type of index 0'.format(i))
        if not isinstance(other, dict):
            result_list[len(result_list):len(result_list)] = list(other)
        else:
            result_list[len(result_list):len(result_list)] = list(other.items())

    if isinstance(iterable1, str):
        return ''.join(result_list)
    elif isinstance(iterable1, tuple):
        return tuple(result_list)
    elif isinstance(iterable1, dict):
        return dict(result_list)
    else:
        return result_list
```

## Others
更多内容请见[Vito's Github](https://github.com/Vito2015/pyextend)

 --- 

_**版权所有，欢迎转载。转载请以超链接形式保留原文链接！**_
_[http://www.vitostack.com/2016/05/04/pyextend-lib/](http://www.vitostack.com/2016/05/04/pyextend-lib/)_



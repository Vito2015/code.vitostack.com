---
title: Hadoop上跑MapReduce的Python示例
date: 2016-05-05 23:15:21
categories: Hadoop
tags: [hadoop, python, mapreduce]
description:
---
>    在这个实例中，我将会向大家介绍如何使用Python 为Hadoop编写一个简单的MapReduce
程序。尽管Hadoop框架是使用Java编写的但是我们仍然需要使用像C++、Python等语言来实现Hadoop程序。
尽管Hadoop官方网站给的示例程序是使用Jython编写并打包成Jar文件，这样显然造成了不便，
其实，不一定非要这样来实现，我们可以使用Python与Hadoop关联进行编程，看看位于``/src/examples/python/WordCount.py``的例子，
你将了解到我在说什么。我们想要做什么？我们将编写一个简单的 MapReduce 程序，使用的是C-Python，而不是Jython编写后打包成jar包的程序。
我们的这个例子将模仿 WordCount 并使用Python来实现，例子通过读取文本文件来统计出单词的出现次数。结果也以文本形式输出，
每一行包含一个单词和单词出现的次数，两者中间使用制表符来想间隔。先决条件编写这个程序之前，你学要架设好Hadoop 集群，
这样才能不会在后期工作抓瞎。如果你没有架设好，那么在后面有个简明教程来教你在Ubuntu Linux 上搭建（同样适用于其他发行版linux、unix）
如何使用Hadoop Distributed File System (HDFS)在Ubuntu Linux 建立单节点的 Hadoop 集群如何使用
Hadoop Distributed File System (HDFS)在Ubuntu Linux 建立多节点的 Hadoop 集群.
Python的MapReduce代码使用Python编写MapReduce代码的技巧就在于我们使用了``HadoopStreaming``来帮助我们在Map 和 Reduce
间传递数据通过STDIN (标准输入)和STDOUT (标准输出).我们仅仅使用Python的``sys.stdin``来输入数据，使用``sys.stdout``输出数据，
这样做是因为``HadoopStreaming``会帮我们办好其他事。这是真的，别不相信！

## Map: mapper.py
将下列的代码保存在``/home/hadoop/mapper.py``中，他将从STDIN读取数据并将单词成行分隔开，生成一个列表映射单词与发生次数的关系：注意：要确保这个脚本有足够权限（``chmod +x /home/hadoop/mapper.py``）。
```python
#!/usr/bin/env python
 
import sys
 
# input comes from STDIN (standard input)
for line in sys.stdin:
    # remove leading and trailing whitespace
    line = line.strip()
    # split the line into words
    words = line.split()
    # increase counters
    for word in words:
        # write the results to STDOUT (standard output);
        # what we output here will be the input for the
        # Reduce step, i.e. the input for reducer.py
        #
        # tab-delimited; the trivial word count is 1
        print '%s\\t%s' % (word, 1)
```
在这个脚本中，并不计算出单词出现的总数，它将快速的输出 "<word> 1" ，尽管<word>可能会在输入中出现多次，计算是留给后来的Reduce步骤（或叫做程序）来实现。当然你可以改变下编码风格，完全尊重你的习惯。
## Reduce: reducer.py
将代码存储在``/home/hadoop/reducer.py`` 中，这个脚本的作用是从``mapper.py`` 的STDIN中读取结果，然后计算每个单词出现次数的总和，并输出结果到STDOUT。同样，要注意脚本权限：``chmod +x /home/hadoop/reducer.py``
```python
#!/usr/bin/env python
 
from operator import itemgetter
import sys
 
# maps words to their counts
word2count = {}
 
# input comes from STDIN
for line in sys.stdin:
    # remove leading and trailing whitespace
    line = line.strip()
 
    # parse the input we got from mapper.py
    word, count = line.split('\\t', 1)
    # convert count (currently a string) to int
    try:
        count = int(count)
        word2count[word] = word2count.get(word, 0) + count
    except ValueError:
        # count was not a number, so silently
        # ignore/discard this line
        pass
 
# sort the words lexigraphically;
#
# this step is NOT required, we just do it so that our
# final output will look more like the official Hadoop
# word count examples
sorted_word2count = sorted(word2count.items(), key=itemgetter(0))
 
# write the results to STDOUT (standard output)
for word, count in sorted_word2count:
    print '%s\\t%s'% (word, count)
```

## 测试你的代码
``cat data | map | sort | reduce`` 
我建议你在运行MapReduce job测试前尝试手工测试你的``mapper.py`` 和 ``reducer.py`` 脚本，以免得不到任何返回结果这里有一些建议，关于如何测试你的Map和Reduce的功能：

``hadoop@ubuntu:~$ echo "foo foo quux labs foo bar quux" | /home/hadoop/mapper.py``
> foo     1
> foo     1
> quux    1
> labs    1
> foo     1
> bar     1

 --- 

``hadoop@ubuntu:~$ echo "foo foo quux labs foo bar quux" | /home/hadoop/mapper.py | sort | /home/hadoop/reducer.py``

> bar     1
> foo     3
> labs    1

 --- 

 _using on\[object Object\]e of the ebooks as example input_
 _(see below on where to get the ebooks_
``hadoop@ubuntu:~$ cat /tmp/gutenberg/20417-8.txt | /home/hadoop/mapper.py``
> The     1
> Project 1
> Gutenberg       1
> EBook   1
> of      1
> [...] 
> (you get the idea)
>
> quux    2
>
> quux    1

 ---

为了这个例子，我们将需要三种电子书：
下载他们，并使用us-ascii编码存储 解压后的文件，保存在临时目录，比如``/tmp/gutenberg``.
``hadoop@ubuntu:~$ ls -l /tmp/gutenberg/ ``
> total 3592
> -rw-r--r-- 1 hadoop hadoop  674425 2007-01-22 12:56 20417-8.txt
> -rw-r--r-- 1 hadoop hadoop 1423808 2006-08-03 16:36 7ldvc10.txt
> -rw-r--r-- 1 hadoop hadoop 1561677 2004-11-26 09:48 ulyss12.txt

``hadoop@ubuntu:~$``
在我们运行MapReduce job 前，我们需要将本地的文件复制到HDFS中：

 ``hadoop@ubuntu:/usr/local/hadoop$ bin/hadoop dfs -copyFromLocal /tmp/gutenberg gutenberg``
 ``hadoop@ubuntu:/usr/local/hadoop$ bin/hadoop dfs -ls``

> Found 1 items
> /user/hadoop/gutenberg  <dir>

``hadoop@ubuntu:/usr/local/hadoop$ bin/hadoop dfs -ls gutenberg``

> Found 3 items
> /user/hadoop/gutenberg/20417-8.txt      <r 1>   674425
> /user/hadoop/gutenberg/7ldvc10.txt      <r 1>   1423808
> /user/hadoop/gutenberg/ulyss12.txt      <r 1>   1561677


现在，一切准备就绪，我们将在运行Python MapReduce job 在Hadoop集群上。像我上面所说的，我们使用的是帮助我们传递数据在Map和Reduce间并通过STDIN和STDOUT，进行标准化输入输出。

```shell 
hadoop@ubuntu:/usr/local/hadoop$ bin/hadoop jar contrib/streaming/hadoop-0.19.1-streaming.jar
 -mapper /home/hadoop/mapper.py 
 -reducer /home/hadoop/reducer.py 
 -input gutenberg/* 
 -output gutenberg-output
```
在运行中，如果你想更改Hadoop的一些设置，如增加Reduce任务的数量，你可以使用“-hadoop@ubuntu:/usr/local/hadoop$ bin/hadoop jar contrib/streaming/hadoop-0.19.1-streaming.jar 
 -mapper ...

一个重要的备忘是关于这个任务将会读取HDFS目录下的HDFS目录下的目录。
之前执行的结果如下：
```
hadoop@ubuntu:/usr/local/hadoop$ bin/hadoop jar contrib/streaming/hadoop-0.19.1-streaming.jar 
 -mapper /home/hadoop/mapper.py -reducer /home/hadoop/reducer.py -input gutenberg/* 
 -output gutenberg-output
```

> additionalConfSpec_:null
>  null=@@@userJobConfProps_.get(stream.shipped.hadoopstreaming
>  packageJobJar: [/usr/local/hadoop-datastore/hadoop-hadoop/hadoop-unjar54543/]
>  [] /tmp/streamjob54544.jar tmpDir=null
>  [...] INFO mapred.FileInputFormat: Total input paths to process : 7
>  [...] INFO streaming.StreamJob: getLocalDirs(): [/usr/local/hadoop-datastore/hadoop-hadoop/mapred/local]
>  [...] INFO streaming.StreamJob: Running job: job_200803031615_0021
>  [...]
>  [...] INFO streaming.StreamJob:  map 0%  reduce 0%
>  [...] INFO streaming.StreamJob:  map 43%  reduce 0%
>  [...] INFO streaming.StreamJob:  map 86%  reduce 0%
>  [...] INFO streaming.StreamJob:  map 100%  reduce 0%
>  [...] INFO streaming.StreamJob:  map 100%  reduce 33%
>  [...] INFO streaming.StreamJob:  map 100%  reduce 70%
>  [...] INFO streaming.StreamJob:  map 100%  reduce 77%
>  [...] INFO streaming.StreamJob:  map 100%  reduce 100%
>  [...] INFO streaming.StreamJob: Job complete: job_200803031615_0021
> 
> 
>  [...] INFO streaming.StreamJob: Output: gutenberg-output  hadoop@ubuntu:/usr/local/hadoop$ 


正如你所见到的上面的输出结果，Hadoop 同时还提供了一个基本的WEB接口显示统计结果和信息。
当Hadoop集群在执行时，你可以使用浏览器访问,检查结果是否输出并存储在HDFS目录下的中：

``hadoop@ubuntu:/usr/local/hadoop$ bin/hadoop dfs -ls gutenberg-output ``
> Found 1 items
> /user/hadoop/gutenberg-output/part-00000     <r 1>   903193  2007-09-21 13:00
> hadoop@ubuntu:/usr/local/hadoop$ 

可以使用 命令检查文件目录

``hadoop@ubuntu:/usr/local/hadoop$ bin/hadoop dfs -cat gutenberg-output/part-00000``
> "(Lo)cra"       1
> "1490   1
> "1498," 1
> "35"    1
> "40,"   1
> "A      2
> "AS-IS".        2
> "A_     1
> "Absoluti       1
> [...]
> hadoop@ubuntu:/usr/local/hadoop$

注意比输出，上面结果的(")符号不是Hadoop插入的。

 --- 

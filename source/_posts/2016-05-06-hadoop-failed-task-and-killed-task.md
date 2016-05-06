---
title: hadoop failed task和killed task介绍
date: 2016-05-06 19:37:09
categories: Hadoop
tags: [hadoop, hadoop性能优化]
description:
---

>    failed task可理解为自杀，也就是task本身出了问题而自杀；killed task可理解为是他杀，也就是jobtracker认为这个任务的执行是多余的，所以把任务直接杀掉。起初用hadoop的时候经常在一个complete的job中看到几个failed 或者是 killed task，还经常好奇为什么有的时候task的失败不会影响到整个job的失败，而有的时候就会使整个job的失败，到底failed和killed task对整个job的影响是什么？
<!--more-->
## failed task
failed task出现的原因可分为以下几种情况：

- child task失败，比如map/reduce任务中抛出了异常，child JVM会将这个error汇报给tasktracker，tasktracker再回将这个error汇报给jobtracker
- child JVM失败，比如启动child task的JVM本身出现了bug，导致进程直接死掉，此时tasktracker会知道child JVM已经退出，并汇报给jobtracker此次task attempt失败
- 任务超时，如果某个任务很长时间都没有更新状态，则认为任务超时。有的任务虽然执行时间非常长，但它不停的在更新自己的状态，所以系统也不会认为这是个超时任务
- tasktracker由于软件或硬件的原因直接挂掉了。对于这种情况，tasktracker会停止向jobtracker发送心跳，jobtracker会认为这是个dead node并把该节点加入黑名单，从此不再给这个节点分配任务，直到问题被修复后tasktracker重新汇报心跳。我遇到最囧的情况就是当各节点hosts不一致的时候，会出现tasktracker向jobtasker发送心跳，但jobtracker不能正确向tasktracker，形成了半死不活的节点～。

hadoop本身的一个设计理念就是在普通的pc硬件上构建高可靠性的系统，任何failed task都不会引起整个job的失败，因为所有失败的任务都会被重新执行（reschedule execution），只有当重新执行的次数超过4次，才会把这任务标记为失败，导致整个job的失败。

## killed task
在介绍killed task之前，先介绍一下speculative execution。举个简单的例子，如果某个job有2000个map task，已经完成了1999个，只剩下一个task由于硬件比较慢而成为拖尾任务，为了减少拖尾任务对整个job运行时间的影响，jobtracker会重新启动一个一模一样的duplicate task和原有的task并行的执行，这样有一个task执行成功，整个map过程就会结束。speculative execution只有个处理拖尾任务的优化策略，并不能提高系统的可靠性。
介绍完speculative execution后我们来看看killed task的情况。killed task可能在两种情况下发生，一个是speculative execution中两个并行duplicate task中如果有一个执行成功，另一个将被kill掉；第二种情况是如果某个tasktracker挂了，那么正在该节点上面跑的任务都将被标记为killed


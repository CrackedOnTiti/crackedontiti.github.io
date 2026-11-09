---
title: GLaDOS
slug: glados
status: featured
order: 4
role: Co-built the compiler and the virtual machine
team: 5
period: Sep – Nov 2025
stack: [Haskell]
links:
  repo: https://github.com/CrackedOnTiti/glados_ss
  docs: https://crackedontiti.github.io/Glados_Documentation/
summary: A compiler and virtual machine in Haskell. A C-like language compiled to custom bytecode.
---

## Problem

An Epitech project: design a C-like language, compile it to our own bytecode and run it on our own
virtual machine, all in Haskell.

## What I built

In a team of five, I co-built the compiler and the VM.

## How it works

<div data-diagram="glados"></div>

## Results

A working toolchain for a C-like language with optional semicolons and static typing. Programs
compile to a WebAssembly-like custom bytecode and run on our VM, and the toolchain can display the
AST and the IR for debugging.

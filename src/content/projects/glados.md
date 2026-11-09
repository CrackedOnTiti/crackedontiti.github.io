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

In a team of five, I co-built the compiler and the VM, the bytecode format and the command-line
tool, wrote most of the test suites, and wrote the language documentation: the mdBook site and the
BNF grammar.

## How it works

<div data-diagram="glados"></div>

## Results

A working toolchain: C-like syntax with optional semicolons, static typing, recursion and control
flow. Programs compile to a WebAssembly-like custom bytecode and run on our VM. The command-line
tool can show the AST and the IR, compile to bytecode, or run a bytecode file. 208 test cases.

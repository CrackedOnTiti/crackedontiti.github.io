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
tag: "Epitech"
monogram: "GL"
# Placeholder until GLaDOS has its own logo: HolyC's, from the repo (docs/assets/HolyC_Logo.png).
logo: ../../assets/projects/glados/glados-logo-holyc.png
tagline: "A compiler and virtual machine, in Haskell."
intro: "A statically typed, C-like language compiled to a custom WebAssembly-like bytecode and run on our own VM, with the AST and IR available for inspection."
flow:
  - "Source"
  - "Parser"
  - "AST"
  - "IR"
  - "Bytecode"
  - "VM"
highlights:
  - "Co-built the compiler"
  - "Co-built the virtual machine"
state: "Shipped"
media:
  - terminal: glados-factorial
    title: "glados --ir < factorial.c"
    caption: "Recursive factorial: run on the VM, then the IR the compiler emits."
  - terminal: glados-link
    title: "glados --compile-obj · --link · --run"
    caption: "Separate compilation: two object files linked into one program, then run."
  - terminal: glados-errors
    title: "glados < test_3_2_undefined_func.c"
    caption: "Errors carry the line and column, and exit with code 84."
  - terminal: glados-tests
    title: "stack test"
    caption: "End of the Hspec suite: 208 examples, 0 failures."
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

Programs can also be compiled to separate object files and linked. Errors report the line and
column, and the Hspec test suite runs 208 tests with no failures.

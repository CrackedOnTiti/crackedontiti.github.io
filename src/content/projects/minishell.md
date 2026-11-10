---
title: minishell
slug: minishell
status: origins
order: 1
role: Solo
team: 1
period: Mar – May 2024, Epitech first year
stack: [C]
links:
  repo: https://github.com/CrackedOnTiti/minishell
tag: "Epitech first year"
tagline: "My first-year Unix shell in C, published as submitted."
intro: "Kept exactly as I turned it in, next to a 2026 self-audit of everything wrong with it."
highlights:
  - "fork / execve, PATH lookup, builtins, my own libc"
  - "Audit with AddressSanitizer: heap overflows, fd leaks, wait-status bugs"
  - "What I would do differently today"
state: "Archived"
media:
  - terminal: minishell-asan
    title: "mysh_asan (-fsanitize=address)"
    caption: "AddressSanitizer run, excerpt: a heap overflow on \"echo a\", a crash with an empty environment, and 131,547 bytes leaked on \"true\"."
  - terminal: minishell-session
    title: "mysh < session"
    caption: "What works (PATH lookup, \";\", setenv and unsetenv, \"cd -\") and what does not: no pipes, no redirections, exit status 84."
summary: My first-year Unix shell in C. The code is unchanged from what I submitted in 2024; a 2026 self-audit of what was wrong with it sits alongside.
---

The audit covers heap overflows found with AddressSanitizer, file descriptor leaks, wait-status
bugs, and what I would do differently. Reading old code honestly is part of the security mindset.

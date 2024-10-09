#!/bin/bash

bun build --packages external --target=node --format=cjs index.ts --outfile index.cjs

pkg . --out-path build

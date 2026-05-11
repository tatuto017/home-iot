#!/bin/bash

. "$HOME/.local/bin/env"
export UV_PROJECT_ENVIRONMENT=.venv
export PATH=$PATH:$HOME/.local/bin

uv run python amazon_login.py 2> /home/tatuto/Python/amazon_login.log

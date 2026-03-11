#!/bin/bash

cd /home/tatuto/Python
. ./bin/activate
python router_plug.py > /home/tatuto/log/router_plug_$(date "+%Y%m%d").log 2>&1

exit $?

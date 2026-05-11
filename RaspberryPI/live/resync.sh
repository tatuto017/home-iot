#!/bin/bash

systemctl --user stop onedrive.service
yes | onedrive --resync --sync
systemctl --user start onedrive.service

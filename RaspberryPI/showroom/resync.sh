#!/bin/bash

systemctl --user stop onedrive.service
onedrive --sync --resync --synced-no-confirm
systemctl --user start onedrive.service

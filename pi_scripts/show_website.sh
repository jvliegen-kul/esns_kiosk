#!/bin/bash

last_change=$(curl https://api.github.com/repos/jvliegen-kul/esns_kiosk/commits/main 2>&1 | grep date | tail -n 1)

firefox --kiosk https://jvliegen-kul.github.io/esns_kiosk/ &

sleep 10

# Find Firefox browser process ID
firefox_pid=$(pgrep firefox | head -1)

# Check if Firefox is running
while [[ -z $firefox_pid ]]; do
  echo "Firefox browser is not running yet."
  sleep 5
  firefox_pid=$(pgrep firefox | head -1)
done

echo "Firefox browser process ID: $firefox_pid"
echo "Last change in github"
echo "$last_change"

# Loop to send keyboard events
while true; do
  sleep 5
  current_change=$(curl https://api.github.com/repos/jvliegen-kul/esns_kiosk/commits/main 2>&1 | grep date | tail -n 1)
  echo "$current_change"

  if [ "$last_change" != "$current_change" ]; then
      kill -9 $firefox_pid

      firefox --kiosk https://jvliegen-kul.github.io/esns_kiosk/ &
      sleep 10

     while [[ -z $firefox_pid ]]; do
       echo "Firefox browser is not running yet."
       sleep 5
       firefox_pid=$(pgrep firefox | head -1)
     done

     last_change=$current_change
  fi
done


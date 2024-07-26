### Steam Auto Message Deleter
This script is made to cycle through your post history on the steam community forums and delete any comments you've made. This will not work for locked threads which have the delete option disabled.

### How to Use:
To use this script you'll need Tampermonkey: https://www.tampermonkey.net/

Edit the setTimeout value to be higher if needed.

Script has only been tested in Chrome.

The script will auto forward you to page 1 if you're on the posthistory page.

When loading the script you'll have two input fields, one is for a Min Page and the other is for a Max Page. By default the Max Page value will be + 9 of the Min Page value, you can however set it higher.

There will be an option to click a Reset button, this will clear your localStorage.

If anything goes wrong and you need to disable the script make sure you also check localStorage in the console. If something is stored type localStorage.clear() before running the operation again.

Once the script is done an alert popup will appear telling you, and localStorage will be cleared.

### Notes:
The script is only set up to delete posts (comments) you've made. It will not delete threads, but this is something I can add in later.
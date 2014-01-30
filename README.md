Scratchingpost
==============

Integrate Cut Cats' Kitties in the Sky (KITS) dispatch system with other
systems.

Designed to be run on Heroku.

Configuration
-------------

Configuration is stored in environment variables.

### SCRATCHINGPOST_AIRPLANE_URL

URL, including trailing '/' to KITS.


### SCRATCHINGPOST_USERNAME

Google username for user that this app will use to log into KITS.

### SCRATCHINGPOST_PASSWORD

Google password for user that this app will use to log into KITS.

### SCRATCHINGPOST_SPREADSHEET_ID

Google Spreadsheet ID for the spreadsheet where data exported from KITS will
be stored.

### SCRATCHINGPOST_WORKSHEET_ID

Google Spreadsheet worksheet ID for worksheet where data exported from kITS
will be stored.

Commands
--------

Currently, this application is implemented as management commands that can
be run under [Heroku's scheduler add-on](https://addons.heroku.com/scheduler).

### sp kits2sheet

Scrape todays jobs from KITS into a Google Spreadsheet. 

ResPlus Multi Tool

ResPlus.Multi.Tool.V0.0.7-Alpha


===============================================

This app will be a travel search / ticket booking web app for all public transportation in Sweden!
All with realtime gps integrated in App with Google Maps so you can track every aspect of your trip including Vehicle positions,Tripadvisor,Route Planner,Webhocked real time updates for instant information about
Delays,Station/Operators updates,Track number,Warnings and mutch more! 
Get your information in app or instant updates to your mail or Push Notifications on any device, all your choice.

How is it built and what makes it tick? 
# Backend/  -> Node.js + Express proxy to Trafiklabs APi for travel data & Trafikverkets Travel and stations updates
Backend fetches all travel data in Sweden of the supported Operators by Python Modules and GTFS Files from the Swedish Trafikverket AB and TrafikLabs wonderfull APi.
We mirror host all travel data files on our SelfHosted servers that later gets the api calls from the user.
So the user never use any data directly from Trafikverket or any Operator.

Travel data includes all public transport in sweden including Busses,Trains,Tunnelbanan and even Ferrys!
Our goal is to collect and display as mutch realtime info as possible to the user.
Simply put ResPlus MultiTool does what no other Trip App in sweden does and uses all avalible sources to collects all information there is to find about your trip and gives you more Travel data then any other App and pressent all information in a beautiful and user friendly way.

SUPPORTED OPERATORS : (And what data they share)

Operator	Abbreviation	Static data	Real-time data	Vehicle positions	Occupancy data       Tickets
SL	            sl	            ✔️	             ✔️	       ✔️	                                ✔️
UL	ul	✔️	✔️	✔️	
Sörmlandstrafiken	sormland	✔️			
Östgötatrafiken	otraf	✔️	✔️	✔️	✔️
JLT	jlt	✔️	✔️	✔️	
Kronoberg	krono	✔️	✔️	✔️	
KLT	klt	✔️	✔️	✔️	
Gotland	gotland	✔️	✔️	✔️	
Blekingetrafiken	blekinge	✔️			
Skånetrafiken	skane	✔️	✔️	✔️	✔️
Hallandstrafiken	halland	✔️			
Västtrafik	vt	✔️			
Värmlandstrafik	varm	✔️	✔️	✔️	
Örebro	orebro	✔️	✔️	✔️	
Västmanland	vastmanland	✔️	✔️	✔️	
Dalatrafik	dt	✔️	✔️	✔️	
X-trafik	xt	✔️	✔️	✔️	
Din Tur - Västernorrland	dintur	✔️	✔️	✔️	
Jämtland	jamtland	✔️			
Västerbotten	vasterbotten	✔️			
Norrbotten	norrbotten	✔️			
BT buss	btbuss	✔️			
Destination Gotland	dg	✔️			
Falcks Omnibus AB	falcks	✔️			
Flixbus	flixbus	✔️			
Härjedalingen	harje	✔️			
Lennakatten	lenna	✔️			
Luleå Lokaltrafik	lulea	✔️			
Masexpressen	masen	✔️			
Mälartåg	malartag	✔️			
Norrtåg	vy-norrtag	✔️			
Ressel Rederi	ressel	✔️			
Roslagens sjötrafik	roslagen	✔️			
SJ	sj	✔️			
SJ Norge	sjnorge	✔️			
Sjöstadstrafiken (Stockholm Stad)	sjostadstrafiken	✔️			
Skellefteåbuss	skelleftea	✔️			
Snälltåget	snalltaget	✔️			
Strömma Turism & Sjöfart AB	stromma	✔️			
TiB ersättningstrafik (VR Sverige)	tib-vr-sverige	✔️			
TJF Smalspåret	tjf	✔️			
Trosabussen	trosa	✔️			
Tågab	tagab	✔️			
VR	vr	✔️			
Vy Norge	vy-norge	✔️			
Vy Tåg AB	vy-varmlandnorge	✔️			
Vy Värmlandstrafik	vy-varmlandstrafik	✔️			
Y-Buss	ybuss	✔️		


*As of Version 0.0.6 Ticket booking is supported for all swedish Operators.
GPS is beeing added to all operators next major update.


*********************************** Other Features **************************************************************** 

# JWT-auth and on device postgrendb userdatabase (.env) for maximum privacy.
Users are added to .inv files and pushed to the server ones a day to avoid using a online sql database. 

# Ticket booking function that generates a 100% Identical ticket as the operators. A Ticket clone with valid ticket id from the Operator and qr code that can be scanned!!
(OBS OBS I do not condone nor encurage anyone breaking the law! Do not use this ticket to validate to the Operator! 
You will be committing fraud and SJ might crash all togheter so ... yeah.
This function will be re-worked to a subscription based ticket system before launch.
But for now it stays, enjoy a smooth testing experiance. 

# PDF Bundler that makes a .pdf ticket and then use a node auto mail function sending the ticket to the user specified email (Like the Operator would do when booking on there site)
# Ticket gets delivred to the users mail by " ticket@resplus.plus.se "

 ** Register a Alpha account for a 14day trial today!
    this is only our first Alpha version so only 14 days per user right now
    do not ask for more we will let you know when BETA is live **
 
#######################################################
             Change log / What to add next 
#######################################################


# - backend/  -

* More Real-time data inc Vehicle position gps and Occupancy data.
* More options and support to save favorites and routes to be able to fast book regular trips.
* Add Push Notifications and RSS feed for updates on your station & Notification on updates to close by stations (within 3km)
* Ticket price of source Operator displayed in search results.


* More gnix load balancers ( test 2500 more users )

# - frontend

* Add more pictures ala travel style 
* Create better logo / Banners / Buttons 
* Improve search results page 
* Google maps window with Vehicle positions of close by Vehicles
* Add a Taxi/Uber Booking function that can be used from google maps
* Speed of gps and weather rapport for station on search and Notifications
* Auto fill forms 


* Relay all static GTFS data to our proxy server every 24h and fetch our own updates on api calls.
  ( Coding done just need to do some size and speed research & Tests on this before switch ) 

* Port to and push executables for all major OS.
  ( APK for android already done & Amst4ff are working on iOS. )
  
 * Push the Docker Version  



#########################################################################
                            Suggestens
                            Messages 
        @@@@@@@@@@@@@@ Contact and Thanks @@@@@@@@@@@@@@@@@@@@@@@@@@@@@
#########################################################################

# Use netex to add more Länstrafik data of all operators, might decrease latancy on gps data


Request account or give us feedback
Contact us @ resplus@multitool.se

If you want access to the rest of the multi tool collection contact @
apexmultitool@multitool.se and tell us about your self.
Adding users to our MCP MultiTool server for testing,
all the AI hacking tools you will ever need and a privacy first uncensored forum for all registerd users.


Tools Included so far ...

Matkollen.MultiTool.V1.0.0-BETA

Multi.Gambling.bot.twitch

Fake.Swish.MultiTool.V2.0.1-Android

NFC.Relay.MultiTool.V1.0.3

Freja.ID.mULTItOOL.v0.0.2-Alpha


Updating weekly so stay tuned for updates in the Tool Forum!
If you want to help out on any of our projects plz tell us and lets vibe code! 




# Relivio

Relivio is a browser prototype built by ByteLabs at HackRift 2025. It helps food vendors list surplus food for pickup and gives community organisations a place to find available donations.

[Try the browser demo](https://relivio.netlify.app/) · [View the HackRift submission](https://devpost.com/software/bytelabs-food-waste)

## What you can try

- Browse sample donations in the feed or on the map.
- Open **Donate** to create a listing with a photo, quantity, pickup location and time.
- Accept a sample donation and mark it as collected.

The prototype uses sample data and keeps demo changes in the current browser session. Refreshing the page resets them.


## Run locally

With Python installed, run this command from the repository folder on Windows.

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

The map, address lookup and externally hosted assets need an internet connection. [Open the local app](http://127.0.0.1:8000/)

## Built with

HTML, CSS, JavaScript, Leaflet and OpenStreetMap.

## Team

Jordan Yeo and Phua Cheng Ann built Relivio as ByteLabs for HackRift 2025. [Project credits](https://devpost.com/software/bytelabs-food-waste)

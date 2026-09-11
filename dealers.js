/* ============================================================
   DANE DEALEROW — makieta.

   Struktura: kraj -> lista dealerow. Trzy poziomy nawigacji
   w panelu (wszyscy -> kraj -> dealer) czytaja wylacznie stad.

   pos.x / pos.y  = pozycja pinezki kraju na map-with-pins.jpg,
                    w procentach szerokosci / wysokosci obrazka.
                    Ustawione RECZNIE (mapka nie ma potwierdzonego
                    rzutu, wiec nie liczymy ich wzorem).

   UWAGA: telefon, e-mail i adres to dane zastepcze generowane
   w script.js (buildPlaceholderContact). W zrodle ich nie ma —
   lista wejsciowa zawierala wylacznie kraj + nazwe.
   ============================================================ */

window.DEALERS_CONTACT_IS_PLACEHOLDER = true;

window.DEALERS = [
  {
    "id": "US",
    "country": "USA",
    "pos": {
      "x": 13.16,
      "y": 32.74
    },
    "dealers": [
      {
        "name": "MarineMax Islamorada",
        "city": "Islamorada"
      },
      {
        "name": "MarineMax Jupiter",
        "city": "Jupiter"
      },
      {
        "name": "MarineMax Miami",
        "city": "Miami"
      },
      {
        "name": "MarineMax Marathon",
        "city": "Marathon"
      },
      {
        "name": "MarineMax Fort Myers",
        "city": "Fort Myers"
      },
      {
        "name": "MarineMax Yacht Center",
        "city": ""
      },
      {
        "name": "MarineMax Sarasota",
        "city": "Sarasota"
      },
      {
        "name": "MarineMax Clearwater",
        "city": "Clearwater"
      },
      {
        "name": "MarineMax Naples",
        "city": "Naples"
      },
      {
        "name": "MarineMax Palm Beach at PGA Marina",
        "city": "Palm Beach at PGA Marina"
      },
      {
        "name": "MarineMax St. Petersburg",
        "city": "St. Petersburg"
      },
      {
        "name": "MarineMax Pompano",
        "city": "Pompano"
      },
      {
        "name": "MarineMax Ocean Reef",
        "city": "Ocean Reef"
      },
      {
        "name": "MarineMax Stuart",
        "city": "Stuart"
      },
      {
        "name": "MarineMax Venice",
        "city": "Venice"
      },
      {
        "name": "MarineMax Pensacola",
        "city": "Pensacola"
      },
      {
        "name": "MarineMax Jacksonville",
        "city": "Jacksonville"
      },
      {
        "name": "MarineMax Cocoa",
        "city": "Cocoa"
      },
      {
        "name": "MarineMax Panama City",
        "city": "Panama City"
      },
      {
        "name": "MarineMax Lake Lanier",
        "city": "Lake Lanier"
      },
      {
        "name": "MarineMax Norwalk",
        "city": "Norwalk"
      },
      {
        "name": "MarineMax Kent Island",
        "city": "Kent Island"
      },
      {
        "name": "MarineMax Lake Hopatcong",
        "city": "Lake Hopatcong"
      },
      {
        "name": "MarineMax Westbrook",
        "city": "Westbrook"
      },
      {
        "name": "MarineMax West Palm Beach",
        "city": "West Palm Beach"
      },
      {
        "name": "Silver Seas Yachts",
        "city": ""
      },
      {
        "name": "Silver Seas Yachts",
        "city": ""
      },
      {
        "name": "Silver Seas Yachts",
        "city": ""
      },
      {
        "name": "Silver Seas Yachts",
        "city": ""
      },
      {
        "name": "Skipper Bud’s Grand Haven, MI",
        "city": "Grand Haven, MI"
      },
      {
        "name": "SkipperBud’s Harrison Township, MI",
        "city": "Harrison Township, MI"
      },
      {
        "name": "SkipperBud’s Winthrop Harbor, IL",
        "city": "Winthrop Harbor, IL"
      },
      {
        "name": "SkipperBud’s Marblehead, OH",
        "city": "Marblehead, OH"
      },
      {
        "name": "SkipperBud’s, Pewaukee, WI",
        "city": "Pewaukee, WI"
      },
      {
        "name": "SkipperBud’s, Sturgeon Bay, WI",
        "city": "Sturgeon Bay, WI"
      },
      {
        "name": "MarineMax Fort Walton Beach",
        "city": "Fort Walton Beach"
      },
      {
        "name": "MarineMax Savannah",
        "city": "Savannah"
      },
      {
        "name": "MarineMax Danvers",
        "city": "Danvers"
      },
      {
        "name": "MarineMax Boston",
        "city": "Boston"
      },
      {
        "name": "MarineMax Excelsior",
        "city": "Excelsior"
      },
      {
        "name": "MarineMax Rogers",
        "city": "Rogers"
      },
      {
        "name": "MarineMax Lake Ozark",
        "city": "Lake Ozark"
      },
      {
        "name": "MarineMax Osage Beach",
        "city": "Osage Beach"
      },
      {
        "name": "MarineMax Lake Norman",
        "city": "Lake Norman"
      },
      {
        "name": "MarineMax Wrightsville Beach",
        "city": "Wrightsville Beach"
      },
      {
        "name": "MarineMax Brick",
        "city": "Brick"
      },
      {
        "name": "MarineMax Ocean View",
        "city": "Ocean View"
      },
      {
        "name": "MarineMax Somers Point",
        "city": "Somers Point"
      },
      {
        "name": "MarineMax Huntington",
        "city": "Huntington"
      },
      {
        "name": "MarineMax Grand Lake",
        "city": "Grand Lake"
      },
      {
        "name": "MarineMax Newport",
        "city": "Newport"
      },
      {
        "name": "MarineMax Wakefield",
        "city": "Wakefield"
      },
      {
        "name": "MarineMax Charleston",
        "city": "Charleston"
      },
      {
        "name": "MarineMax Greenville",
        "city": "Greenville"
      },
      {
        "name": "MarineMax Lake Wylie",
        "city": "Lake Wylie"
      },
      {
        "name": "MarineMax Dallas",
        "city": "Dallas"
      },
      {
        "name": "MarineMax Dallas Yacht Center",
        "city": "Dallas Yacht Center"
      },
      {
        "name": "MarineMax Houston",
        "city": "Houston"
      },
      {
        "name": "Prince William Marina",
        "city": ""
      }
    ]
  },
  {
    "id": "CA",
    "country": "Canada",
    "pos": {
      "x": 13.16,
      "y": 20.75
    },
    "dealers": [
      {
        "name": "Freedom Marine International Yacht Sales",
        "city": ""
      },
      {
        "name": "Freedom Marine International Yacht Sales",
        "city": ""
      },
      {
        "name": "Marine 360",
        "city": ""
      }
    ]
  },
  {
    "id": "CR",
    "country": "Costa Rica",
    "pos": {
      "x": 14.73,
      "y": 50.28
    },
    "dealers": [
      {
        "name": "Maspor Marine",
        "city": ""
      }
    ]
  },
  {
    "id": "SV",
    "country": "El Salvador",
    "pos": {
      "x": 13.08,
      "y": 48.17
    },
    "dealers": [
      {
        "name": "Maspor Marine",
        "city": ""
      }
    ]
  },
  {
    "id": "GT",
    "country": "Guatemala",
    "pos": {
      "x": 12.58,
      "y": 47.52
    },
    "dealers": [
      {
        "name": "Maspor Marine",
        "city": ""
      }
    ]
  },
  {
    "id": "HN",
    "country": "Honduras",
    "pos": {
      "x": 13.62,
      "y": 47.53
    },
    "dealers": [
      {
        "name": "Maspor Marine",
        "city": ""
      }
    ]
  },
  {
    "id": "MX",
    "country": "Mexico",
    "pos": {
      "x": 9.72,
      "y": 44.62
    },
    "dealers": [
      {
        "name": "Camino Al Mare",
        "city": ""
      }
    ]
  },
  {
    "id": "NI",
    "country": "Nicaragua",
    "pos": {
      "x": 14.32,
      "y": 48.96
    },
    "dealers": [
      {
        "name": "Maspor Marine",
        "city": ""
      }
    ]
  },
  {
    "id": "PA",
    "country": "Panama",
    "pos": {
      "x": 15.68,
      "y": 51.21
    },
    "dealers": [
      {
        "name": "Maspor Marine",
        "city": ""
      }
    ]
  }
];

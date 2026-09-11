/* ============================================================
   DANE DEALEROW — pobrane z produkcyjnego globusa na galeon.yachts
   (strona glowna, sekcja #globe-section, dwie strony paginacji CMS).

   Struktura: kontynent -> kraj -> dealer. Dokladnie ta sama hierarchia,
   ktora ma panel: wszyscy -> kontynent -> kraj -> dealer.

   pos.x / pos.y  = pozycja pinezki KONTYNENTU na map-with-pins.jpg,
                    w procentach szerokosci / wysokosci obrazka.
                    Ustawione recznie — grafika mapy nie ma potwierdzonego
                    rzutu, wiec pinezek nie da sie policzyc ze wspolrzednych.
                    lat / lng krajow sa w danych i czekaja na moment,
                    w ktorym rzut bedzie znany.

   Dwie rzeczy odziedziczone po zrodle, do poprawienia w Webflow:
   - Meksyk ma przypisany kontynent "South America"
   - "UAE" i "United Arab Emirates" to dwa osobne kraje
   ============================================================ */

window.DEALERS = [
  {
    "id": "europe",
    "name": "Europe",
    "pos": {
      "x": 47.1,
      "y": 21.1
    },
    "countries": [
      {
        "id": "austria",
        "name": "Austria",
        "lat": 47.516231,
        "lng": 14.550072,
        "dealers": [
          {
            "name": "Aventura Point",
            "address": "Regus Vienna Europaplatz 2/1/2 A1150 Vienna",
            "phone": "+4369917772668",
            "email": "office@aventuraboats.at",
            "page": "/dealers/aventura-point-s-r-o---austria",
            "maps": "https://maps.app.goo.gl/aBb6tbQBRqzM1Uht9"
          },
          {
            "name": "Atal Nautica",
            "phone": "+386(0)34924000",
            "email": "info@atal.si",
            "page": "/dealers/atal-nautica-d-o-o---austria"
          },
          {
            "name": "Aventura Boats",
            "address": "Vordermayrbergstraße 33 A4030 LINZ",
            "phone": "+4369917772668",
            "email": "office@aventuraboats.at",
            "page": "/dealers/aventura-boats-austria",
            "maps": "https://maps.app.goo.gl/zkN6HfqgX3unhw1a8"
          },
          {
            "name": "Aventura Boats",
            "address": "Rohr 1 6973 Fußach Austria",
            "phone": "+4369917772668",
            "email": "office@aventuraboats.at",
            "page": "/dealers/aventura-boats-bodensee",
            "maps": "https://maps.app.goo.gl/iWTx1nnNk4e93b5v9"
          }
        ]
      },
      {
        "id": "belgium",
        "name": "Belgium",
        "lat": 50.85119231680612,
        "lng": 4.356531348849454,
        "dealers": [
          {
            "name": "RCMarine",
            "address": "Navis Yachts  Zeewindstraat 3  8300 Knokke",
            "phone": "+32475230959",
            "email": "info@navis-yachts.be",
            "page": "/dealers/rcmarine",
            "maps": "https://maps.app.goo.gl/x56sDysHBP2HwGP76"
          }
        ]
      },
      {
        "id": "bulgaria",
        "name": "Bulgaria",
        "lat": 42.733883,
        "lng": 25.48583,
        "dealers": [
          {
            "name": "NLS Yachting Group Kft.",
            "address": "Győrújbarát, Veres Péter u. 10, 9081 Hungary",
            "email": "office@yachtinggroup.hu",
            "page": "/dealers/nls-yachting-group-kft---bulgaria",
            "maps": "https://maps.app.goo.gl/gixUC5VfbVw6Mytu6"
          }
        ]
      },
      {
        "id": "croatia",
        "name": "Croatia",
        "lat": 45.1,
        "lng": 15.2,
        "dealers": [
          {
            "name": "Atal Nautica",
            "address": "MARINA PUNAT Puntica 7 51521 Punat Croatia",
            "phone": "+385915470206",
            "email": "info@atal.si",
            "page": "/dealers/atal-nautica-d-o-o---croatia",
            "maps": "https://maps.app.goo.gl/kRs57WspJYoJRpup9"
          },
          {
            "name": "Atal Nautica",
            "address": "Zeleni Trg 1 Zagreb",
            "phone": "+38551395222",
            "email": "info@atal.si",
            "page": "/dealers/atal-nautica",
            "maps": "https://maps.app.goo.gl/UZkrZ7TMWBPFYaaQ9"
          },
          {
            "name": "Atal Nautica",
            "address": "Put gradine 1 22243 Murter",
            "phone": "+385919111130",
            "email": "office@aventuraboats.sk",
            "page": "/dealers/aventura-boats",
            "maps": "https://maps.app.goo.gl/VCnUdcCmoVgDN1997"
          }
        ]
      },
      {
        "id": "cyprus",
        "name": "Cyprus",
        "lat": 35.01657377443092,
        "lng": 33.147618454518515,
        "dealers": [
          {
            "name": "IMPORTICA LTD",
            "address": "Ayia Napa Marina East Tower, Office 6, 52 Ayia Thekla Street Ayia Napa, 5330",
            "phone": "+35723251116",
            "email": "info@cy-boats.com",
            "page": "/dealers/importica-ltd-ayia-napa-marina",
            "maps": "https://maps.app.goo.gl/eLDdczKjVvj4jNrV9"
          },
          {
            "name": "IMPORTICA LTD",
            "address": "Nicosia: Iras 2B, Latsia Industrial Area, 2234, Nicosia,",
            "phone": "+35799450302",
            "email": "info@cy-boats.com",
            "page": "/dealers/importica-ltd-nicosia",
            "maps": "https://maps.app.goo.gl/MNGvRUBmhxDoR4rk6"
          },
          {
            "name": "IMPORTICA LTD",
            "address": "Building D2, Limassol Marina St-Shop 7, Limassol 3601",
            "phone": "+35725010561",
            "email": "info@diamantidesyachting.com",
            "page": "/dealers/diamantides-yachting",
            "maps": "https://maps.app.goo.gl/q8i22JHY8GzAvwPP7"
          }
        ]
      },
      {
        "id": "czech-republic",
        "name": "Czech Republic",
        "lat": 49.817492,
        "lng": 15.472962,
        "dealers": [
          {
            "name": "Aventura Point",
            "address": "Bohdalecká 1576/23C, 101 00, Praha",
            "phone": "+420723718004",
            "email": "office@aventuraboats.sk",
            "page": "/dealers/aventura-point-s-r-o---czech-republic",
            "maps": "https://maps.app.goo.gl/nwKQx87ZJSiHwDT46"
          }
        ]
      },
      {
        "id": "denmark",
        "name": "Denmark",
        "lat": 56.26392,
        "lng": 9.501785,
        "dealers": [
          {
            "name": "Bluebay Marine A/S",
            "address": "Kejlstrupvej 241 8600 Silkeborg",
            "phone": "+4586822222",
            "email": "info@bluebay-marine.com",
            "page": "/dealers/bluebay-marine-a-s",
            "maps": "https://maps.app.goo.gl/Kvb9WPz1QyX52Zcy6"
          }
        ]
      },
      {
        "id": "finland",
        "name": "Finland",
        "lat": 61.92411,
        "lng": 25.748151,
        "dealers": [
          {
            "name": "GN Boats Oy",
            "address": "Ratatie 16 B 67 01300 VANTAA",
            "phone": "+358405092995",
            "email": "juha@gnboats.fi",
            "page": "/dealers/gn-boats-oy---finland",
            "maps": "https://maps.app.goo.gl/GnqkdMQ4qUhmpK6fA"
          }
        ]
      },
      {
        "id": "france",
        "name": "France",
        "lat": 46.227638,
        "lng": 2.213749,
        "dealers": [
          {
            "name": "RCMarine",
            "address": "Espace Joseph Grimaud, 430 Cor Philippe Giovannini 83500 La Seyne-sur-Mer",
            "phone": "(33)623915238",
            "email": "galeon@rc-marine.fr",
            "page": "/dealers/rc-marine-sasu-mediterrane-la-seyne-s",
            "maps": "https://maps.app.goo.gl/kfp98TB4KcAPk2sT9"
          },
          {
            "name": "RCMarine",
            "address": "204 Route du Plan de la Tour 83 120 Sainte-Maxime",
            "phone": "(33)0494564710",
            "email": "galeon@rc-marine.fr",
            "page": "/dealers/rcmarine-sainte-maxime-2",
            "maps": "https://maps.app.goo.gl/aZzqMXBRTs4L7xcB8"
          },
          {
            "name": "RCMarine",
            "address": "14 Av. du Dr Robin, 83400 Hyères",
            "phone": "(33)631662337",
            "email": "galeon@rc-marine.fr",
            "page": "/dealers/rcmarine-quo-vadis-hyeres",
            "maps": "https://maps.app.goo.gl/zxi5YNi5VMWf4LRJ8"
          },
          {
            "name": "RCMarine",
            "address": "Marina Baie des Anges, 1001 Avenue de la Batterie, 06270 Villeneuve-Loubet",
            "phone": "(33)0493331354",
            "email": "galeon@rc-marine.fr",
            "page": "/dealers/rcmarine-antibes-villeneuve-loubet",
            "maps": "https://maps.app.goo.gl/1WimdDbKfQPdi4L2A"
          },
          {
            "name": "RCMarine",
            "address": "Port de la Napoule 06210 Mandelieu La Napoule",
            "phone": "(33)0493498090",
            "email": "galeon@rc-marine.fr",
            "page": "/dealers/rcmarine-mandelieu-la-napoule",
            "maps": "https://maps.app.goo.gl/jPKZwWV8tevbBPqt9"
          },
          {
            "name": "RCMarine",
            "address": "1, allee du Grand Port 83310 Cogolin",
            "phone": "(33)0494564710",
            "email": "galeon@rc-marine.fr",
            "page": "/dealers/rcmarine-cogolin",
            "maps": "https://maps.app.goo.gl/uaJZus3hvCcAbUFZ7"
          },
          {
            "name": "RCMarine",
            "address": "Terre-plein O Port de L’Herbaudière 85330 Noirmoutier-en-l’Île",
            "phone": "(33)0764469383",
            "email": "galeon@rc-marine.fr",
            "page": "/dealers/rcmarine-noirmoutier",
            "maps": "https://maps.app.goo.gl/6RZCSMAhZLzH3Xqg9"
          },
          {
            "name": "RCMarine",
            "address": "23 quai Marillac17000 LA ROCHELLE",
            "phone": "(33)0546441024",
            "email": "galeon@rc-marine.fr",
            "page": "/dealers/rcmarine-la-rochelle",
            "maps": "https://maps.app.goo.gl/pRanyv7BMY9nmTiHA"
          },
          {
            "name": "RCMarine",
            "address": "2 Impasse des Gabiers 56640 ARZON",
            "phone": "(33)0297536194",
            "email": "galeon@rc-marine.fr",
            "page": "/dealers/rcmarine-crouesty",
            "maps": "https://maps.app.goo.gl/trcyJjpHsfc9xHmZ6"
          },
          {
            "name": "RCMarine",
            "address": "Route de la Roche sur Yon 85800 SAINT-GILLES-CROIX-DE-VIE",
            "phone": "(33)0251564207",
            "email": "galeon@rc-marine.fr",
            "page": "/dealers/rcmarine-saint-gilles-croix-de-vie",
            "maps": "https://maps.app.goo.gl/Qu7KxsUtqQStTXag8"
          },
          {
            "name": "RCMarine",
            "address": "Port Olona 85100 LES SABLES D’OLONNE",
            "phone": "(33)0251323767",
            "email": "galeon@rc-marine.fr",
            "page": "/dealers/rcmarine-les-sables-dolonne",
            "maps": "https://maps.app.goo.gl/8nvH25N3GemsVhHD6"
          },
          {
            "name": "RCMarine",
            "address": "30 rue des Champs Francs 44210 PORNIC",
            "phone": "(33)0240823430",
            "email": "galeon@rc-marine.fr",
            "page": "/dealers/rcmarine-pornic",
            "maps": "https://maps.app.goo.gl/UmGhw5w1qtUKn2TD7"
          }
        ]
      },
      {
        "id": "germany",
        "name": "Germany",
        "lat": 51.165691,
        "lng": 10.451526,
        "dealers": [
          {
            "name": "Segel Auto Boote - General Distributor",
            "address": "Yachthafen Ringel, An d. Havel 38, 14542 Werder (Havel), Germany",
            "email": "info@segel-auto-boote.de",
            "page": "/dealers/segel-auto-boote---germany",
            "maps": "https://maps.app.goo.gl/NcV7hK3svdZFsuaH7"
          },
          {
            "name": "Argo Yachting",
            "address": "Büro Ostsee, Ancora Marina, An der Wiek 7 – 15, 23730 Neustadt in Holstein, Germany",
            "phone": "+491606161640",
            "email": "de@argoyachting.com",
            "page": "/dealers/argo-yachting-germany",
            "maps": "https://maps.app.goo.gl/iNWeHC4W33otb1Jb8"
          },
          {
            "name": "Bootcenter Konstanz GmbH & Co. KG",
            "address": "Reichenaustr. 45 78467 Konstanz",
            "phone": "+49753189330",
            "email": "info@bootcenter.com",
            "page": "/dealers/bootcenter-konstanz-gmbh-co-kg-germany",
            "maps": "https://maps.app.goo.gl/S152js3szB12PPyJ8"
          },
          {
            "name": "HL Schiffstechnik GmbH",
            "address": "Im Wassersportzentrum 5 Schnaidt 41, 88079 Kressbronn am Bodensee, Niemcy",
            "email": "info@hl-schiffstechnik.de",
            "page": "/dealers/hl-schiffstechnik-gmbh---germany",
            "maps": "https://maps.app.goo.gl/khwPpMHXbufboKFY6"
          },
          {
            "name": "Premium Boot De GmbH",
            "address": "Bootswerk Berlin, Adlergestell 351, 12489 Berlin",
            "phone": "030/64329866,0175/1662339",
            "email": "info@premium-boot.de",
            "page": "/dealers/premium-boot-de-gmbh",
            "maps": "https://maps.app.goo.gl/embFYjTJxVYghs8b6"
          }
        ]
      },
      {
        "id": "greece",
        "name": "Greece",
        "lat": 39.0742,
        "lng": 21.8243,
        "dealers": [
          {
            "name": "Extravagant Yachts E.E.",
            "address": "19 Poseidonos Avenue 17455, Alimos, Athens",
            "phone": "+306945708572",
            "email": "sales@extravagant-yachts.com",
            "page": "/dealers/extravagant-yachts-e-e-greece",
            "maps": "https://maps.app.goo.gl/HGWhHurZxhCQUm5BA"
          }
        ]
      },
      {
        "id": "hungary",
        "name": "Hungary",
        "lat": 47.162494,
        "lng": 19.503304,
        "dealers": [
          {
            "name": "NLS Yachting Group Kft.",
            "address": "Győrújbarát, Veres Péter u. 10, 9081 Hungary",
            "email": "office@yachtinggroup.hu",
            "page": "/dealers/nls-yachting-group-kft---hungary",
            "maps": "https://maps.app.goo.gl/gixUC5VfbVw6Mytu6"
          }
        ]
      },
      {
        "id": "italy",
        "name": "Italy",
        "lat": 41.87194,
        "lng": 12.56738,
        "dealers": [
          {
            "name": "RCMarine",
            "address": "Via San Rocco, 11 – 26100 Cremona",
            "phone": "0372432548",
            "email": "info@pagliarini.it",
            "page": "/dealers/pagliarini-international-boats",
            "maps": "https://maps.app.goo.gl/2FVP1ZMYvRyxfgjp6"
          },
          {
            "name": "RCMarine",
            "address": "Punta Asfodeli, Via Iscia Piumica – 07026 Porto Rotondo (SS)",
            "phone": "3292143642",
            "email": "info@pagliarini.it",
            "page": "/dealers/pagliarini-group-2",
            "maps": "https://maps.app.goo.gl/p2WxDybsWCeebjaE9"
          },
          {
            "name": "RCMarine",
            "address": "Porto Mirabello, Viale Italia – 19100 La Spezia",
            "phone": "3384419530",
            "email": "giampaolo@pagliarini.it",
            "page": "/dealers/pagliarini-group-3",
            "maps": "https://maps.app.goo.gl/KMrZzkMJzAoymJiQA"
          },
          {
            "name": "RCMarine",
            "address": "Marina Colombiera, Via Poggio Scafa – 19031 Ameglia (SP)",
            "phone": "3292143643",
            "email": "omar@pagliarini.it",
            "page": "/dealers/pagliarini-group-4",
            "maps": "https://maps.app.goo.gl/kQimkr8NsjAx8qF78"
          },
          {
            "name": "RCMarine",
            "address": "Porto Carolina, Via Ameglia 9 – 19032 Senato di Lerici (SP)",
            "phone": "3292143643",
            "email": "omar@pagliarini.it",
            "page": "/dealers/pagliarini-group-5",
            "maps": "https://maps.app.goo.gl/5KDJcDKHMMqYFZk76"
          },
          {
            "name": "RCMarine",
            "address": "Senato – Via Ameglia 9 – 19032 Senato di Lerici (SP)",
            "phone": "3292143643",
            "email": "omar@pagliarini.it",
            "page": "/dealers/pagliarini-shipyard",
            "maps": "https://maps.app.goo.gl/3f4bFx4MnviaTHmt9"
          }
        ]
      },
      {
        "id": "latvia",
        "name": "Latvia",
        "lat": 57.04468288049303,
        "lng": 24.036513836271446,
        "dealers": [
          {
            "name": "LC Sports SIA",
            "address": "Birzes iela 9A, Rīga, LV-1016, Latvia",
            "phone": "+37120012500",
            "email": "janis@laivucentrs.lv",
            "page": "/dealers/lc-sports-sia---latvia",
            "maps": "https://maps.app.goo.gl/XBkPYfimctgTDheYA"
          }
        ]
      },
      {
        "id": "lithuania",
        "name": "Lithuania",
        "lat": 55.169438,
        "lng": 23.881275,
        "dealers": [
          {
            "name": "Hobiocentras",
            "address": "Dubysos g. 25A, Klaipėda LT-93194",
            "email": "dovydas@hobiocentras.lt",
            "page": "/dealers/hobiocentras---lithuania",
            "maps": "https://maps.app.goo.gl/PHCJ5g2ghJnVm2PQ7"
          }
        ]
      },
      {
        "id": "luxemburg",
        "name": "Luxemburg",
        "lat": 49.611,
        "lng": 6.13,
        "dealers": [
          {
            "name": "RCMarine",
            "address": "Navis Yachts Zeewindstraat 3 8300 Knokke",
            "phone": "+32475230959",
            "email": "galeon@rc-marine.fr",
            "page": "/dealers/rc-marine-luxembug",
            "maps": "https://maps.app.goo.gl/x56sDysHBP2HwGP76"
          }
        ]
      },
      {
        "id": "malta",
        "name": "Malta",
        "lat": 35.937496,
        "lng": 14.375416,
        "dealers": [
          {
            "name": "Fapi Motors LTD",
            "address": "Focus Building, Mdina Road, Attard ATD 9037, Malta",
            "phone": "+35623392328",
            "email": "hermann@famalco.net",
            "page": "/dealers/fapi-motors-ltd",
            "maps": "https://maps.app.goo.gl/AcLdcnBmuSgRV4hLA"
          }
        ]
      },
      {
        "id": "monaco",
        "name": "Monaco",
        "lat": 43.750298,
        "lng": 7.412841,
        "dealers": [
          {
            "name": "RCMarine",
            "address": "Marina Baie des Anges, 1001 Avenue de la Batterie, 06270 Villeneuve-Loubet",
            "phone": "+33685088183",
            "email": "galeon@rc-marine.fr",
            "page": "/dealers/rc-marine-sasu---monaco"
          }
        ]
      },
      {
        "id": "montenegro",
        "name": "Montenegro",
        "lat": 42.7087,
        "lng": 19.3744,
        "dealers": [
          {
            "name": "Atal Nautica",
            "address": "Prvomajska 4 85310 Budva, Mne",
            "phone": "+38163271888",
            "email": "info@atal.si",
            "page": "/dealers/atal-nautica-d-o-o-montenegro",
            "maps": "https://maps.app.goo.gl/mCV8owRp9j8CFF4x9"
          }
        ]
      },
      {
        "id": "nederland",
        "name": "Nederland",
        "lat": 52.37098994838417,
        "lng": 4.899494825970154,
        "dealers": [
          {
            "name": "RCMarine",
            "address": "Nieuwe Zeedijk 1, 3221 LZ Hellevoetsluis, Nederland",
            "phone": "+31181322010",
            "email": "sales@navis-yachting.nl",
            "page": "/dealers/navis-yachting",
            "maps": "https://maps.app.goo.gl/4JHYZK7BPwhRQQ5X9"
          }
        ]
      },
      {
        "id": "norway",
        "name": "Norway",
        "lat": 60.472024,
        "lng": 8.468946,
        "dealers": [
          {
            "name": "Nordic Clean AS",
            "address": "8GMQ+J8G Grimstad, Norwegia",
            "email": "kjetil@galeon.no",
            "page": "/dealers/galeon-norge-as",
            "maps": "https://maps.app.goo.gl/gnQAkbagNdHUvFMV8"
          }
        ]
      },
      {
        "id": "poland",
        "name": "Poland",
        "lat": 51.919438,
        "lng": 19.145136,
        "dealers": [
          {
            "name": "Nautica Boats Service",
            "address": "Mazurska 98, 11-513 Rydzewo",
            "email": "jan.nowakowski@centrumnautica.pl",
            "page": "/dealers/nautica-boats-service--poland",
            "maps": "https://maps.app.goo.gl/1kvTeq537PzQmrUB6"
          },
          {
            "name": "Galeon Yachts",
            "address": "Starogardzka 22, 83-010 Straszyn",
            "email": "sales@galeon.pl",
            "page": "/dealers/galeon-yachts---poland",
            "maps": "https://maps.app.goo.gl/iM7ySehBcrtcKRxo9"
          }
        ]
      },
      {
        "id": "portugal",
        "name": "Portugal",
        "lat": 39.698597674579034,
        "lng": -8.342193872838788,
        "dealers": [
          {
            "name": "Argo Yachting",
            "address": "Unit 1 The Saltings Swanwick Marina Bidge Road Swanwick Southampton SO21 1F",
            "phone": "+44(0)1489885656",
            "email": "sales@argogaleon.com",
            "page": "/dealers/argo-yachting-portugal",
            "maps": "https://maps.app.goo.gl/tqhdcQMdqe7XkPPL7"
          }
        ]
      },
      {
        "id": "serbia",
        "name": "Serbia",
        "lat": 44.0165,
        "lng": 21.0059,
        "dealers": [
          {
            "name": "Atal Nautica",
            "address": "Generala Milutina Vlajica 6 Beograd 11000",
            "phone": "+386(0)34924000",
            "email": "info@atal.si",
            "page": "/dealers/atal-nautica-d-o-o-serbia",
            "maps": "https://maps.app.goo.gl/eTgU8Rt7N1YDoefz6"
          }
        ]
      },
      {
        "id": "slovakia",
        "name": "Slovakia",
        "lat": 48.669026,
        "lng": 19.699024,
        "dealers": [
          {
            "name": "Aventura Lifestyle s.r.o.",
            "address": "Bajkalská 29/C, 82101 Bratislava, Slovakia",
            "page": "/dealers/aventura-lifestyle-s-r-o-slovakia",
            "maps": "https://maps.app.goo.gl/quiUZKZT4nqzCNmn9"
          }
        ]
      },
      {
        "id": "slovenia",
        "name": "Slovenia",
        "lat": 46.151241,
        "lng": 14.995463,
        "dealers": [
          {
            "name": "Atal Nautica",
            "address": "Bukovžlak 65 d 3000 Celije",
            "phone": "+386(0)34924000",
            "email": "info@atal.si",
            "page": "/dealers/atal-nautica-d-o-o---slovenia",
            "maps": "https://maps.app.goo.gl/wWVSz4gQ6RVrmfGr9"
          }
        ]
      },
      {
        "id": "spain",
        "name": "Spain",
        "lat": 40.463667,
        "lng": -3.74922,
        "dealers": [
          {
            "name": "Argo Yachting",
            "address": "Torre de Capitanía s/n, Edificio C5 Locales 103-104, 07181 – Portals Nous (Calvià) Mallorca, Spain",
            "phone": "+34971676439",
            "email": "sales@argogaleon.com",
            "page": "/dealers/argo-yachting-spain",
            "maps": "https://maps.app.goo.gl/UdU9bFNbCGzWtq4WA"
          },
          {
            "name": "Donmarino Boats",
            "address": "Lugar Urbanización Puerto Deportivo, 0 S/N, 29680 Estepona, Málaga, Hiszpania",
            "email": "info@donmarinoboats.es",
            "page": "/dealers/donmarino-boats---spain",
            "maps": "https://maps.app.goo.gl/NPRd7a8ZeuHkZ6H98"
          },
          {
            "name": "Argo Yachting",
            "address": "Port Petit 320, ES – 07660, Cala D’Or, Mallorca, Spain",
            "phone": "+34971643353",
            "email": "sales@argogaleon.com",
            "page": "/dealers/argo-yachting-cala-dor",
            "maps": "https://maps.app.goo.gl/PMFR47MBipxNkgoK9"
          },
          {
            "name": "Argo Yachting",
            "address": "Local 114, Marina Botafoc, 07800, Ibiza, Spain",
            "phone": "+34871554307",
            "email": "sales@argogaleon.com",
            "page": "/dealers/argo-yachting-ibiza",
            "maps": "https://maps.app.goo.gl/QaAPx4sQ38NTGBEg8"
          },
          {
            "name": "Donmarino Boats",
            "address": "Club Náutico Port Balis – Local n°13  Sant Andreu de Llavaneres  08392 Barcelona",
            "phone": "+34629537172",
            "email": "info@mnyachts.com",
            "page": "/dealers/marenostrum-yachts",
            "maps": "https://maps.app.goo.gl/yGvBN4fNaTUakCF77"
          },
          {
            "name": "Donmarino Boats",
            "address": "Port Ginesta – Local n°810 Castelldefels 08860 Barcelona",
            "phone": "+34629537172",
            "email": "info@mnyachts.com",
            "page": "/dealers/marenostrum-yachts-2",
            "maps": "https://maps.app.goo.gl/jPZpiV841954PphH7"
          },
          {
            "name": "Donmarino Boats",
            "address": "Polígono industrial de Raos 11E 39600 Camargo (Cantabria)",
            "phone": "+34942369151",
            "email": "jaimepiris@yatesycosas.com",
            "page": "/dealers/yates-y-cosas",
            "maps": "https://maps.app.goo.gl/TWrscLJVfr3c7Vn36"
          },
          {
            "name": "Donmarino Boats",
            "address": "Náutica Paco Avda. de León, 25 – 36960 Sanxenxo (Pontevedra)",
            "phone": "+34986720268",
            "email": "info@nauticapaco.es",
            "page": "/dealers/nautica-paco",
            "maps": "https://maps.app.goo.gl/cJHYoUnakTCHgvg16"
          },
          {
            "name": "Donmarino Boats",
            "address": "Náutica Paco Puerto deportivo Juan Carlos I – 36960 Sanxenxo (Pontevedra)",
            "phone": "+34986723384",
            "email": "info@nauticapaco.es",
            "page": "/dealers/nautica-paco-2",
            "maps": "https://maps.app.goo.gl/xxjUFrkGNnV9JoQV8"
          },
          {
            "name": "Donmarino Boats",
            "address": "Avenida de la Pista, 14 E46470 Massanassa",
            "phone": "+34963240099",
            "email": "info@nautica-aza.com",
            "page": "/dealers/nautica-aza",
            "maps": "https://maps.app.goo.gl/bRNDd8uyUntg8EmA7"
          },
          {
            "name": "Donmarino Boats",
            "address": "Vía Hotel Guadalpín, 2P, 29604 Marbella",
            "phone": "+34951319028",
            "email": "info@xtrememarine.com",
            "page": "/dealers/xtreme-marine",
            "maps": "https://maps.app.goo.gl/iH3KVAEMu2JHr37f6"
          },
          {
            "name": "Donmarino Boats",
            "address": "Varadero Puerto Cabopino. Marbella. 29602",
            "phone": "+34951319028",
            "email": "info@xtrememarine.com",
            "page": "/dealers/xtreme-marine-2",
            "maps": "https://maps.app.goo.gl/SzjpspDH6ry6a4Z8A"
          },
          {
            "name": "Donmarino Boats",
            "address": "Avda. Julio Iglesias, Casa N apto. 110, 29660 Marbella",
            "phone": "+34951319028",
            "email": "info@xtrememarine.com",
            "page": "/dealers/xtreme-marine-3",
            "maps": "https://maps.app.goo.gl/KQYsC8mSjyz2XaFGA"
          },
          {
            "name": "Argo Yachting",
            "address": "Moll de Llevant 215, Mahon, 07701",
            "phone": "+43971354208",
            "email": "info@clearwater.es",
            "page": "/dealers/clearwater-marine",
            "maps": "https://maps.app.goo.gl/KPfwj9Qg523p8GJUA"
          }
        ]
      },
      {
        "id": "sweden",
        "name": "Sweden",
        "lat": 60.128161,
        "lng": 18.643501,
        "dealers": [
          {
            "name": "PS Marin Sweden AB",
            "address": "Domherrevägen 19B, 178 39 Ekerö, Szwecja",
            "email": "peter.soderlund@psmarin.se",
            "page": "/dealers/peter-solderlund-marin-ab---sweden",
            "maps": "https://maps.app.goo.gl/bxhqL4aPd2nopWaF9"
          }
        ]
      },
      {
        "id": "switzerland",
        "name": "Switzerland",
        "lat": 46.818188,
        "lng": 8.227512,
        "dealers": [
          {
            "name": "Herzog Marinecenter AG",
            "address": "CH-6053 Alpnachstad",
            "phone": "+41416729191",
            "email": "info@herzog.ch",
            "page": "/dealers/herzog-marinecenter-ag---switzerland",
            "maps": "https://maps.app.goo.gl/Zp9Gk4mCcUFdKy6g6"
          }
        ]
      },
      {
        "id": "ukraine",
        "name": "Ukraine",
        "lat": 48.379433,
        "lng": 31.16558,
        "dealers": [
          {
            "name": "Private Enterprice TRIO",
            "address": "Khmelnetskogo,32 01030 Kiev",
            "phone": "+380675045706",
            "email": "george989@gmail.com",
            "page": "/dealers/private-enterprice-trio---ukraine",
            "maps": "https://maps.app.goo.gl/an6kS4xonkVKVF9v8"
          }
        ]
      },
      {
        "id": "united-kingdom",
        "name": "United Kingdom",
        "lat": 55.378051,
        "lng": -3.435973,
        "dealers": [
          {
            "name": "Argo Yachting",
            "address": "Unit 1, The Saltings, Swanwick Marina, Bridge Road, Swanwick, Southampton SO31 1FA",
            "phone": "+44(0)1489885656",
            "email": "sales@argoyachting.com",
            "page": "/dealers/argo-yachting-united-kingdom-southampton",
            "maps": "https://maps.app.goo.gl/N1fKMBsDDadgeHQcA"
          },
          {
            "name": "Argo Yachting",
            "address": "New North Quay, St Helier, Jersey JE2 3ND, Jersey",
            "phone": "+441534888100",
            "page": "/dealers/quay-boats-ltd",
            "maps": "https://maps.app.goo.gl/dNVNPXuwSqdB3JcR7"
          },
          {
            "name": "Argo Yachting",
            "address": "Windermere Marina Village, Bowness-on-Windermere, Windermere LA23 3JQ",
            "phone": "+441539446004",
            "page": "/dealers/shepherds-boat-sales",
            "maps": "https://maps.app.goo.gl/EY9FiP1gMwZYqLQS8"
          }
        ]
      }
    ]
  },
  {
    "id": "north-america",
    "name": "North America",
    "pos": {
      "x": 14.7,
      "y": 26.4
    },
    "countries": [
      {
        "id": "canada",
        "name": "Canada",
        "lat": 58.43208305780531,
        "lng": -112.27353320869221,
        "dealers": [
          {
            "name": "Freedom Marine",
            "address": "SIDNEY AT PORT SIDNEY MARINA 9835 Seaport Pl, Unit 1D Sidney BC, V8L 4X3",
            "phone": "+1.250.940.9060",
            "email": "freedom@boatingfreedom.com",
            "page": "/dealers/freedom-marine-sidney",
            "maps": "https://maps.app.goo.gl/G9TPcZMWSp672wPJ6"
          },
          {
            "name": "Freedom Marine",
            "address": "VANCOUVER SEAWALL AT COAL HARBOUR MARINA 510 Nicola Street #100 Vancouver BC, V6G 3J7",
            "phone": "+1.604.609.0985",
            "email": "freedom@boatingfreedom.com",
            "page": "/dealers/freedom-marine-canada",
            "maps": "https://maps.app.goo.gl/3WdbjvTJjfuDEpV67"
          },
          {
            "name": "Marine 360",
            "address": "50, 62ième avenue Île-aux-Noix, J0J 1G0",
            "phone": "+15142828484",
            "email": "info@marine360.ca",
            "page": "/dealers/marine-360-v9ez6",
            "maps": "https://maps.app.goo.gl/2wj7nTY2vVD9TQ1j7"
          }
        ]
      },
      {
        "id": "usa",
        "name": "USA",
        "lat": 38.0,
        "lng": -97.0,
        "dealers": [
          {
            "name": "MarineMax Inc.",
            "address": "18025 US Hwy 19 N, Clearwater, FL 33764, Stany Zjednoczone",
            "page": "/dealers/marinemax-inc---usa",
            "maps": "https://maps.app.goo.gl/nHmiQhFznmLn2UpD8"
          },
          {
            "name": "MarineMax Inc.",
            "address": "1601 Ken Thompson Parkway, Sarasota, Florida 34236",
            "phone": "941-388-4411",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-sarasota",
            "maps": "https://maps.app.goo.gl/RnHMt5teybCJtbKi7"
          },
          {
            "name": "MarineMax Inc.",
            "address": "1146 6th Avenue South, Naples, Florida 34102",
            "phone": "239-262-1000",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-fort-myers",
            "maps": "https://maps.app.goo.gl/RBUgNo3HCtnUyquj7"
          },
          {
            "name": "MarineMax Inc.",
            "address": "1146 6th Avenue South, Naples, Florida 34102",
            "phone": "239-262-1000",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-naples",
            "maps": "https://maps.app.goo.gl/RBUgNo3HCtnUyquj7"
          },
          {
            "name": "MarineMax Inc.",
            "address": "2370 SW Palm City Road, Stuart, Florida 34994",
            "phone": "772-287-4495",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-stuart",
            "maps": "https://maps.app.goo.gl/huQ7KmgqJWwKWKrC6"
          },
          {
            "name": "MarineMax Inc.",
            "address": "700 South Federal Highway, Pompano Beach, Florida 33062",
            "phone": "954-783-9555",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-pompano",
            "maps": "https://maps.app.goo.gl/3jayMWVnvEKPdiox7"
          },
          {
            "name": "MarineMax Inc.",
            "address": "700 N.E. 79th Street, Miami, Florida 33138",
            "phone": "305-758-5786",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-2",
            "maps": "https://maps.app.goo.gl/31DECnXSn7uU872v6"
          },
          {
            "name": "MarineMax Inc.",
            "address": "1490 N Stemmons FWY, Lewisville, Texas 75067-2505",
            "phone": "972-436-9979",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-key-largo",
            "maps": "https://maps.app.goo.gl/tuQBbq2L5BWuv1dg7"
          },
          {
            "name": "MarineMax Inc.",
            "address": "1860 Bald Ridge Marina Road, Cumming, Georgia 30041",
            "phone": "770-781-9370",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-cumming",
            "maps": "https://maps.app.goo.gl/pE7xqpKJQ9stzTBj6"
          },
          {
            "name": "MarineMax Inc.",
            "address": "1991 N.E. Catawba Road, Port Clinton, Ohio 43452",
            "phone": "419-797-4492",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-port-clinton",
            "maps": "https://maps.app.goo.gl/wHXkCLc2XP58Vv919"
          },
          {
            "name": "MarineMax Inc.",
            "address": "3605 Thomas Drive, Panama City, Florida 32408",
            "phone": "850-708-1317",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-panama-city",
            "maps": "https://maps.app.goo.gl/ArhrKWhRvuc1kEK4A"
          },
          {
            "name": "MarineMax Inc.",
            "address": "84 W. Airport Blvd., Pensacola, Florida 32503",
            "phone": "850-477-1112",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-pensacola",
            "maps": "https://maps.app.goo.gl/7d5qgKKJtTVLxKYz6"
          },
          {
            "name": "MarineMax Inc.",
            "address": "3001 NASA Parkway, Seabrook, Texas 77586",
            "phone": "281-326-4224",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-seabrook",
            "maps": "https://maps.app.goo.gl/4WwSGCuLxH5cVGoh8"
          },
          {
            "name": "MarineMax Inc.",
            "address": "1490 N Stemmons FWY, Lewisville, Texas 75067-2505",
            "phone": "972-436-9979",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-lewisville",
            "maps": "https://maps.app.goo.gl/tuQBbq2L5BWuv1dg7"
          },
          {
            "name": "MarineMax Inc.",
            "address": "3070 Bagnell Dam Blvd., Lake Ozark, Missouri 65049",
            "phone": "573-365-5382",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-lake-ozark",
            "maps": "https://maps.app.goo.gl/82GXSK3YpA4VnhZR7"
          },
          {
            "name": "MarineMax Inc.",
            "address": "451107 E. 320 Road, Afton, Oklahoma 74331",
            "phone": "918-782-3277",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-afton",
            "maps": "https://maps.app.goo.gl/efH99PoXiPs7wWp88"
          },
          {
            "name": "MarineMax Inc.",
            "address": "200 Fifth Avenue South, Bayport, Minnesota 55003",
            "phone": "651-351-9621",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-bayport",
            "maps": "https://maps.app.goo.gl/6MzU7411zsYtvRKY6"
          },
          {
            "name": "MarineMax Inc.",
            "address": "1500 Riverside, Brick, New Jersey 08724",
            "phone": "732-840-2100",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-new",
            "maps": "https://maps.app.goo.gl/5XL2ZuTW3FUUVEmY9"
          },
          {
            "name": "MarineMax Inc.",
            "address": "600 Bay Avenue, Somers Point, New Jersey 08244",
            "phone": "609-926-0600",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-new-jersey",
            "maps": "https://maps.app.goo.gl/SuEBX7F6fyau3LsbA"
          },
          {
            "name": "MarineMax Inc.",
            "address": "1800 S. Clinton Street, Baltimore, Maryland 21224",
            "phone": "410-732-1260",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-baltimore",
            "maps": "https://maps.app.goo.gl/Utyw5bFXdEf4xGRQ9"
          },
          {
            "name": "MarineMax Inc.",
            "address": "106 Wells Cove Road, Grasonville, Maryland 21638",
            "phone": "410-827-7371",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-grasonville",
            "maps": "https://maps.app.goo.gl/R4XiB9dm6Wjr2VB97"
          },
          {
            "name": "MarineMax Inc.",
            "address": "130 Short Street, Wrightsville Beach, North Carolina 28480",
            "phone": "910-256-8100",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-north-caroline",
            "maps": "https://maps.app.goo.gl/YWtzMgtTDyirCrG26"
          },
          {
            "name": "MarineMax Inc.",
            "address": "1 Masthead Dr, Warwick, Rhode Island 02886",
            "phone": "401-886-7899",
            "email": "galeonyachts@marinemax.com",
            "page": "/dealers/marinemax-rhode-island",
            "maps": "https://maps.app.goo.gl/WKpWSdAKUXa3uAgF6"
          }
        ]
      }
    ]
  },
  {
    "id": "central-america",
    "name": "Central America",
    "pos": {
      "x": 14.1,
      "y": 49.0
    },
    "countries": [
      {
        "id": "guatemala",
        "name": "Guatemala",
        "lat": 14.59332647422268,
        "lng": -90.46458054030767,
        "dealers": [
          {
            "name": "Maspor Marine",
            "address": "20 Calle 16-00, Zona 10 esquina, Guatemala, Guatemala 01010.",
            "phone": "(502)24988000",
            "email": "rmorel@masport-marine.com",
            "page": "/dealers/maspor-marine-guatemala",
            "maps": "https://maps.app.goo.gl/AKxR7i9UnyM4vy839"
          }
        ]
      },
      {
        "id": "honduras",
        "name": "Honduras",
        "lat": 14.86096590239573,
        "lng": -86.99697551840269,
        "dealers": [
          {
            "name": "Maspor Marine",
            "address": "29 Calle, 10 Avenida S.O., Bo. La Guardia, San Pedro Sula, Honduras",
            "phone": "(505)82449150",
            "email": "cfernandez@maspor-marine.com",
            "page": "/dealers/maspor-marine-honduras",
            "maps": "https://maps.app.goo.gl/ffVCMqf3mmvpr9JZ7"
          }
        ]
      },
      {
        "id": "nicaragua",
        "name": "Nicaragua",
        "lat": 12.731682428230627,
        "lng": -85.53507264060757,
        "dealers": [
          {
            "name": "Maspor Marine",
            "address": "Camino de Oriente, Managua, Nicaragua",
            "phone": "(505)87231100",
            "email": "sales@maspor-marine.com",
            "page": "/dealers/maspor-marine-nicaragua",
            "maps": "https://maps.app.goo.gl/egL95AZtLx91YeSeA"
          }
        ]
      },
      {
        "id": "panama",
        "name": "Panama",
        "lat": 8.995935284259284,
        "lng": -79.5101434529283,
        "dealers": [
          {
            "name": "Maspor Marine",
            "address": "Calle 50 Edificio Rita Angelica, San Francisco, Panama, Panama.",
            "phone": "(507)63252631",
            "email": "efaberga@maspor-marine.com",
            "page": "/dealers/maspor-marine-panama",
            "maps": "https://maps.app.goo.gl/LJVsA7r3MEEeQgCx5"
          }
        ]
      }
    ]
  },
  {
    "id": "south-america",
    "name": "South America",
    "pos": {
      "x": 24.7,
      "y": 71.7
    },
    "countries": [
      {
        "id": "mexico",
        "name": "Mexico",
        "lat": 19.421098294164775,
        "lng": -99.12852055406643,
        "dealers": [
          {
            "name": "Camino Al Mare",
            "address": "Av Tulum 232 – B8 Manzana 12 SM 4 Cancún, Centro 77500",
            "phone": "+525591001200",
            "email": "roberto@caminoalmare.com",
            "page": "/dealers/camino-al-mare-tulum",
            "maps": "https://maps.app.goo.gl/vKqz33YEkTv2JLcQ7"
          },
          {
            "name": "Camino Al Mare",
            "address": "Homero 342 piso 4 Col, Polanco Miguel Hidalgo 11560 Ciudad de México",
            "phone": "+529988928679",
            "email": "roberto@caminoalmare.com",
            "page": "/dealers/camino-al-mare",
            "maps": "https://maps.app.goo.gl/B9jDgcHZGhzp1Yx1A"
          }
        ]
      }
    ]
  },
  {
    "id": "asia",
    "name": "Asia",
    "pos": {
      "x": 73.5,
      "y": 34.8
    },
    "countries": [
      {
        "id": "bahrain",
        "name": "Bahrain",
        "lat": 26.064005206065104,
        "lng": 50.551816185267775,
        "dealers": [
          {
            "name": "Ocean World Group",
            "address": "HDS business Center, Cluster M. 908 JLT, Dubai, UAE",
            "phone": "+971524042000",
            "email": "sales@oceanworld.group",
            "page": "/dealers/ocean-world-group-bahrain",
            "maps": "https://maps.app.goo.gl/KbqyZzhLUPH7zCFSA"
          }
        ]
      },
      {
        "id": "cambodia",
        "name": "Cambodia",
        "lat": 12.5657,
        "lng": 104.991,
        "dealers": [
          {
            "name": "Asia Marine Yacht Services Limited",
            "address": "Unit 8, G/F, Aberdeen Marina Tower, 8 Shum Wan Rd, Aberdeen, Hong Kong",
            "phone": "+85226777791",
            "email": "info@asiamarine.com",
            "page": "/dealers/asia-marine-yacht-services-limited-cambodia"
          }
        ]
      },
      {
        "id": "china",
        "name": "China",
        "lat": 35.8617,
        "lng": 104.1954,
        "dealers": [
          {
            "name": "Asia Marine Yacht Services Limited",
            "address": "UNIT 8, G/F, ABERDEEN MARINA TOWER 8 SHUM WAN ROAD ABERDEEN, HONG KONG",
            "phone": "+85226777791",
            "email": "sales@asiamarine.com",
            "page": "/dealers/asia-marine-yacht-services-ltd-china",
            "maps": "https://maps.app.goo.gl/ToRQhK8u41PGpmGi7"
          }
        ]
      },
      {
        "id": "hong-kong",
        "name": "Hong Kong",
        "lat": 22.396428,
        "lng": 114.109497,
        "dealers": [
          {
            "name": "Asia Marine Yacht Services Limited",
            "address": "Unit 8, G/F, Aberdeen Marina Tower, 8 Shum Wan Rd, Aberdeen, Hong Kong",
            "phone": "+85226777791",
            "email": "info@asiamarine.com",
            "page": "/dealers/asia-marine-yacht-services-limited---hong-kong",
            "maps": "https://maps.app.goo.gl/mgNeP4atYaqkVx8a8"
          }
        ]
      },
      {
        "id": "indonesia",
        "name": "Indonesia",
        "lat": -0.7893,
        "lng": 113.9213,
        "dealers": [
          {
            "name": "Asia Marine Yacht Services Limited",
            "address": "Unit 8, G/F, Aberdeen Marina Tower, 8 Shum Wan Rd, Aberdeen, Hong Kong",
            "phone": "+85226777791",
            "email": "sales@asiamarine.com",
            "page": "/dealers/asia-marine-yacht-services-limited-indonesia",
            "maps": "https://maps.app.goo.gl/rx89Qj1PxkPLEfiV8"
          }
        ]
      },
      {
        "id": "israel",
        "name": "Israel",
        "lat": 31.046051,
        "lng": 34.851612,
        "dealers": [
          {
            "name": "Ambil-Yam LTD",
            "address": "9 Yad Harutzim St. Poleg Industrial area, Netania",
            "phone": "+972-9-8358088",
            "email": "info@ambil-yam.co.il",
            "page": "/dealers/ambil-yam-ltd---israel",
            "maps": "https://maps.app.goo.gl/brmwQJx4d9CYFA4a7"
          }
        ]
      },
      {
        "id": "japan",
        "name": "Japan",
        "lat": 36.2048,
        "lng": 138.2529,
        "dealers": [
          {
            "name": "HAUNTS BOAT&SERVICE",
            "address": "Marinaplaza 4F 4-2 SHIRAHO,KANAZAWA-KU,YOKOHAMA,KANAGAWA,JAPAN 2360007",
            "phone": "+8145-778-1532",
            "page": "/dealers/haunts-boat-service",
            "maps": "https://maps.app.goo.gl/XzHnvz92dS25kmJP6"
          }
        ]
      },
      {
        "id": "jordan",
        "name": "Jordan",
        "lat": 30.5852,
        "lng": 36.2384,
        "dealers": [
          {
            "name": "Royal Marine Ltd.",
            "address": "Mecca St. 251, Amman, Jordan",
            "phone": "+96265818343",
            "email": "info@royalmarineint.com",
            "page": "/dealers/royal-marine-ltd-jordan",
            "maps": "https://maps.app.goo.gl/XPFjENVJkLA1qW3X7"
          }
        ]
      },
      {
        "id": "kazakhstan",
        "name": "Kazakhstan",
        "lat": 48.0196,
        "lng": 66.9237,
        "dealers": [
          {
            "name": "Eurasia ST LLC",
            "address": "Almaty, Tole bi str., 296",
            "phone": "+77017891437",
            "email": "salesmanager@e-m.kz",
            "page": "/dealers/eurasia-st-llp-kazakhstan",
            "maps": "https://maps.app.goo.gl/JA72dYipsjroXojn9"
          }
        ]
      },
      {
        "id": "kingdom-of-saudi-arabia",
        "name": "Kingdom of Saudi Arabia",
        "lat": 24.571274822867075,
        "lng": 46.50665555608618,
        "dealers": [
          {
            "name": "Ocean World Group",
            "address": "HDS business Center, Cluster M. 908 JLT, Dubai, UAE",
            "phone": "+971524042000",
            "email": "sales@oceanworld.group",
            "page": "/dealers/ocean-world-group",
            "maps": "https://maps.app.goo.gl/KbqyZzhLUPH7zCFSA"
          }
        ]
      },
      {
        "id": "korea",
        "name": "Korea",
        "lat": 35.9078,
        "lng": 127.7669,
        "dealers": [
          {
            "name": "Gin-A Co. Ltd",
            "address": "Suite 912, Dongbu Root Building, 36 Hwangsaeul-ro, 200 beon-gil, Bundang-gu, Seongnam-si, Gyeonggi-do, Korea Południowa",
            "email": "han.kim@gin-a.kr",
            "page": "/dealers/gin-a-co-ltd---korea",
            "maps": "https://maps.app.goo.gl/A8YBguQncWgDStZj8"
          }
        ]
      },
      {
        "id": "kuwait",
        "name": "Kuwait",
        "lat": 29.3117,
        "lng": 47.4818,
        "dealers": [
          {
            "name": "Ocean World Group",
            "address": "HDS business Center, Cluster M. 908 JLT, Dubai, UAE",
            "phone": "+971524042000",
            "email": "sales@oceanworld.group",
            "page": "/dealers/ocean-world-group-2",
            "maps": "https://maps.app.goo.gl/4naEP4nJD75cUdd27"
          }
        ]
      },
      {
        "id": "lebanon",
        "name": "Lebanon",
        "lat": 33.8547,
        "lng": 35.8623,
        "dealers": [
          {
            "name": "Ocean World Group",
            "address": "HDS business Center, Cluster M. 908 JLT, Dubai, UAE",
            "phone": "+971524042000",
            "email": "sales@oceanworld.group",
            "page": "/dealers/ocean-world-group-lebanon",
            "maps": "https://maps.app.goo.gl/4naEP4nJD75cUdd27"
          }
        ]
      },
      {
        "id": "oman",
        "name": "Oman",
        "lat": 23.59129828970048,
        "lng": 58.381940805906396,
        "dealers": [
          {
            "name": "Ocean World Group",
            "address": "Ocean World boats trading LLC, HDS Business Center, Cluster M, JLT, Dubai",
            "phone": "+971524042000",
            "email": "sales@oceanworld.group",
            "page": "/dealers/ocean-world-gro",
            "maps": "https://maps.app.goo.gl/jZovdDYkYa6dwTuH7"
          }
        ]
      },
      {
        "id": "philippines",
        "name": "Philippines",
        "lat": 12.879721,
        "lng": 121.774017,
        "dealers": [
          {
            "name": "Asia Marine Yacht Services Limited",
            "address": "Unit 8, G/F, Aberdeen Marina Tower, 8 Shum Wan Rd, Aberdeen, Hong Kong",
            "phone": "+85226777791",
            "email": "sales@asiamarine.com",
            "page": "/dealers/asia-marine-yacht-services-ltd-phil",
            "maps": "https://maps.app.goo.gl/5hNwmfciwN1Kfpnv6"
          }
        ]
      },
      {
        "id": "qatar",
        "name": "Qatar",
        "lat": 25.355048676722024,
        "lng": 51.169043994005754,
        "dealers": [
          {
            "name": "Ocean World Group",
            "address": "HDS business Center, Cluster M. 908 JLT, Dubai, UAE",
            "phone": "+971524042000",
            "email": "sales@oceanworld.group",
            "page": "/dealers/ocean-world-group-qatar",
            "maps": "https://maps.app.goo.gl/KbqyZzhLUPH7zCFSA"
          }
        ]
      },
      {
        "id": "singapore",
        "name": "Singapore",
        "lat": 1.352083,
        "lng": 103.819836,
        "dealers": [
          {
            "name": "Asia Marine Yacht Services Limited",
            "address": "11 Cove Drive, #02-04, Sentosa One Degree 15 Marina Club, Singapore 098497",
            "phone": "+6583829331",
            "email": "sg@asiamarine.com",
            "page": "/dealers/asia-marine-yacht-services-limited---singapore",
            "maps": "https://maps.app.goo.gl/ameu9fRb29zuL86k9"
          }
        ]
      },
      {
        "id": "taiwan",
        "name": "Taiwan",
        "lat": 23.6978,
        "lng": 120.9605,
        "dealers": [
          {
            "name": "Asia Marine Yacht Services Limited",
            "address": "Unit 8, G/F, Aberdeen Marina Tower, 8 Shum Wan Rd, Aberdeen, Hong Kong",
            "phone": "+85226777791",
            "email": "info@asiamarine.com",
            "page": "/dealers/asia-marine-yacht-services-limited-taiwan",
            "maps": "https://maps.app.goo.gl/E1e7Sy7xqZyzYYQd8"
          }
        ]
      },
      {
        "id": "thailand",
        "name": "Thailand",
        "lat": 15.870032,
        "lng": 100.992541,
        "dealers": [
          {
            "name": "Asia Marine Yacht Services Limited",
            "address": "20/35, Moo.2, Phuket Boat Lagoon Marina, Thepkrasattri Road, Muang District, Phuket 83000, Thailand",
            "phone": "+6689-508-1333",
            "email": "thailand@asiamarine.com",
            "page": "/dealers/asia-marine-yacht-services-limited---thailand",
            "maps": "https://maps.app.goo.gl/SMo4S7W3eUic29s36"
          }
        ]
      },
      {
        "id": "turkey",
        "name": "Turkey",
        "lat": 38.963745,
        "lng": 35.243322,
        "dealers": [
          {
            "name": "Deniz Yatcilik ve Turizm Tic. Ve San. Ltd. Sti",
            "address": "Tepecik Yolu No 82 Etiler 34337 Beşiktaş / İstanbul / Türkiye",
            "phone": "+90212352659596",
            "email": "info@denizyatcilik.com",
            "page": "/dealers/deniz-yatcilik-ve-turizm-tic-ve-san-ltd-sti---turkey",
            "maps": "https://maps.app.goo.gl/Yhvkd2TG8kh1bYxB8"
          }
        ]
      },
      {
        "id": "united-arab-emirates",
        "name": "United Arab Emirates",
        "lat": 23.645982680353185,
        "lng": 53.90912189469814,
        "dealers": [
          {
            "name": "Ocean World Group",
            "address": "HDS business Center, Cluster M. 908 JLT, Dubai, UAE",
            "phone": "+971524042000",
            "email": "sales@oceanworld.group",
            "page": "/dealers/ocean-world-group-uae",
            "maps": "https://maps.app.goo.gl/KbqyZzhLUPH7zCFSA"
          }
        ]
      },
      {
        "id": "vietnam",
        "name": "Vietnam",
        "lat": 16.1,
        "lng": 107.5,
        "dealers": [
          {
            "name": "IES Corporation",
            "address": "Unit 8, G/F, Aberdeen Marina Tower, 8 Shum Wan Rd, Aberdeen, Hong Kong",
            "phone": "+85226777791",
            "email": "hungnguyen.pnt@gmail.com",
            "page": "/dealers/ies-corporation---vietnam"
          }
        ]
      }
    ]
  },
  {
    "id": "africa",
    "name": "Africa",
    "pos": {
      "x": 52.9,
      "y": 50.6
    },
    "countries": [
      {
        "id": "egypt",
        "name": "Egypt",
        "lat": 26.8206,
        "lng": 30.8025,
        "dealers": [
          {
            "name": "Zenith Marine",
            "phone": "+201222142207",
            "email": "ramiboutari@zenithmarine.net",
            "page": "/dealers/zenith-marine-egypt",
            "maps": "https://maps.app.goo.gl/TTLBmw1PPCzsUbfV7"
          }
        ]
      },
      {
        "id": "morocco",
        "name": "Morocco",
        "lat": 35.78572391713848,
        "lng": -5.797595439548901,
        "dealers": [
          {
            "name": "Aventura Boats Morocco",
            "address": "Avenue Moulay Hicham 14 PL 92000 Tangier, Morocco",
            "phone": "+212764484192",
            "email": "sales@aventuraboats.es",
            "page": "/dealers/aventura-boats-morocco",
            "maps": "https://maps.app.goo.gl/BFQEYbvKLRUrY3sX7"
          }
        ]
      },
      {
        "id": "seychelles",
        "name": "Seychelles",
        "lat": -4.662895582735796,
        "lng": 55.462559556360176,
        "dealers": [
          {
            "name": "Ocean World Group",
            "address": "HDS business Center, Cluster M. 908 JLT, Dubai, UAE",
            "phone": "+971524042000",
            "email": "sales@oceanworld.group",
            "page": "/dealers/ocean-world-group-se",
            "maps": "https://maps.app.goo.gl/KbqyZzhLUPH7zCFSA"
          }
        ]
      }
    ]
  },
  {
    "id": "australia",
    "name": "Australia",
    "pos": {
      "x": 87.6,
      "y": 73.8
    },
    "countries": [
      {
        "id": "australia",
        "name": "Australia",
        "lat": -25.274398,
        "lng": 133.775136,
        "dealers": [
          {
            "name": "Galeon Yachts",
            "email": "sales@galeon.pl",
            "page": "/dealers/galeon-yachts-australia"
          }
        ]
      },
      {
        "id": "new-zealand",
        "name": "New Zealand",
        "lat": -40.900557,
        "lng": 174.885971,
        "dealers": [
          {
            "name": "Galeon Yachts",
            "email": "sales@galeon.pl",
            "page": "/dealers/galeon-yachts-new-zeland"
          }
        ]
      }
    ]
  }
];

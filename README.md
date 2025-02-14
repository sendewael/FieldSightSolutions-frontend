## Team leden

| Team leden        | Studie |
| ----------------- | ------ |
| Mats Couwenberg   | CCS    |
| Sen Dewael        | APP    |
| Laurens Karakolev | AI     |
| Nathan Neve       | AI     |
| Niel Swusten      | APP    |
| Cisse Vandeweyer  | APP    |

## installatie

Eerst en vooral clone de repo lokaal naar je pc/laptop, open daarna het project in uw editor naar keuze en navigeer naar `fieldsightsolutions-frontend` met `cd .\fieldsightsolutions-frontend\`. Run daarna volgend commando:

```
npm install --legacy-peer-deps
```

nadat dit gebeurd is hebben we ook nog angular nodig, voor dit project gebruiken we versie `18.1.0` ook heb je een node versie nodig `>= 20.16.0`.

```
npm install -g @angular/cli@18.1.0
```

Als dan alles juist is geïnstalleerd kan je het project runnen met `ng serve` en dan kan je surfen naar `http://localhost:4200` waar je project kunt bekijken.

Builden van het project gaat met `ng build`

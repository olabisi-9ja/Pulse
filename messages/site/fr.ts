import type { SiteMessages } from "./en";

/** Copie française du site marketing. Le typage garantit que toutes les clés existent. */
const site: SiteMessages = {
  meta: {
    home: {
      title: "Pas de réseau. Payé quand même.",
      description:
        "L'infrastructure de paiement pour les réseaux instables. Une infrastructure de transactions hors ligne à risque maîtrisé et à rapprochement automatique, proposée en tant que service aux PSP, banques, opérateurs de mobile money et plateformes marchandes en Afrique.",
    },
    howItWorks: {
      title: "Comment ça marche",
      description:
        "Coffre, signature, scan, vérification, synchronisation. Découvrez comment PayVault permet d'accepter et de contrôler un paiement en moins d'une seconde sans réseau, puis de le rapprocher plus tard.",
    },
    product: {
      title: "Produit",
      description:
        "Une couche de fiabilité et une acceptation hors ligne garantie : machine à états de connectivité, file durable, rapprochement, coffre hors ligne et découvert. Sans détention de fonds par conception.",
    },
    payLater: {
      title: "Découvert hors ligne et paiement différé",
      description:
        "Permettez à vos clients de payer même lorsque leur solde est court et que le réseau est coupé. La valeur provisionnée est dépensée d'abord, puis un petit découvert qui devient un prêt à court terme après synchronisation.",
    },
    useCases: {
      title: "Cas d'usage",
      description:
        "PSP, réseaux de TPE, banques, opérateurs de mobile money, plateformes marchandes, billettique de transport, paiements scolaires, chaînes de distribution et réseaux d'agents de terrain.",
    },
    coverage: {
      title: "Couverture",
      description:
        "Les Country Packs transforment la devise, les plafonds, les niveaux KYC, les rails et les règles de protection des données en données. Quinze pays africains sont configurés au stade concept.",
    },
    developers: {
      title: "Développeurs",
      description:
        "API REST v1, webhooks et SDK. Émettez des allocations, synchronisez les paiements et recevez les événements de rapprochement dans votre propre grand livre.",
    },
    security: {
      title: "Sécurité",
      description:
        "Modèle de menaces, choix cryptographiques et modèle sans détention de fonds. Le double dépensement est borné, toujours détecté et récupéré auprès du titulaire identifié (KYC).",
    },
    pricing: {
      title: "Tarifs",
      description:
        "Des frais d'intégration, des frais de plateforme, une tarification à l'usage par terminal actif ou par transaction réglée, et un support entreprise. Contactez-nous pour un pilote.",
    },
    about: {
      title: "À propos",
      description:
        "L'infrastructure de paiement pour les réseaux instables. PayVault est une jeune entreprise qui construit une infrastructure de transactions hors ligne pour l'Afrique. Ce que nous construisons, ce que nous ne sommes pas, et notre façon de travailler.",
    },
    contact: {
      title: "Demander un pilote",
      description:
        "Parlez-nous de votre organisation et de votre marché. Nous répondons personnellement à chaque demande de pilote.",
    },
  },

  nav: {
    product: "Produit",
    howItWorks: "Comment ça marche",
    payLater: "Payer plus tard",
    useCases: "Cas d'usage",
    coverage: "Couverture",
    developers: "Développeurs",
    pricing: "Tarifs",
    pilot: "Demander un pilote",
    openApp: "Ouvrir l'app",
    console: "Console partenaire",
    menu: "Menu",
    closeMenu: "Fermer le menu",
    primary: "Navigation principale",
    language: "Langue",
    skip: "Aller au contenu",
    switchTo: "English",
    switchLabel: "Lire cette page en anglais",
  },

  footer: {
    blurb:
      "L'infrastructure de paiement pour les réseaux instables. Proposée en tant que service aux partenaires agréés.",
    disclaimer:
      "PayVault est un prestataire technologique. Ce n'est ni une banque, ni un portefeuille, ni un transmetteur de fonds, et il ne détient jamais les fonds des clients.",
    productTitle: "Produit",
    companyTitle: "Entreprise",
    resourcesTitle: "Ressources",
    security: "Sécurité",
    about: "À propos",
    contact: "Contact",
    docs: "Docs",
    rights: "© {year} PayVault",
    privacy: "Confidentialité",
    terms: "Conditions",
    status: "Stade précoce. Les données pays sont au stade concept.",
  },

  notFound: {
    eyebrow: "404",
    title: "Cette page n'existe pas.",
    body: "Le lien est peut-être ancien ou mal saisi. Tout le reste fonctionne, avec ou sans réseau.",
    home: "Retour à l'accueil",
  },

  common: {
    requestPilot: "Demander un pilote",
    seeHow: "Voir comment ça marche",
    readDocs: "Lire la documentation",
    seeCoverage: "Voir la couverture",
    illustrative: "Chiffres et écrans à titre d'illustration.",
    partners: "Partenaires agréés",
    status: "Statut",
    available: "Disponible",
    planned: "Prévu",
    inPreview: "En préversion",
  },

  mock: {
    offline: "Pas de réseau",
    greeting: "Coffre hors ligne",
    vaultNote: "Bloqué chez votre partenaire",
    overdraft: "Découvert disponible",
    overdraftNote: "Accordé par votre partenaire",
    pay: "Payer",
    request: "Demander",
    recent: "Paiements récents",
    payments: [
      { name: "Étal du marché", meta: "Signé hors ligne, 09:12", amount: "-1 500" },
      { name: "Billet de bus", meta: "Signé hors ligne, 07:40", amount: "-500" },
      { name: "Pharmacie", meta: "Synchronisé, hier", amount: "-3 200" },
    ],
    currency: "XOF",
    vaultAmount: "18 000",
    overdraftAmount: "4 000",
    caption: "Écran d'illustration. Les montants sont fictifs.",
    scanToPay: "Scanner pour payer",
    screen: {
      initials: "AK",
      hello: "Bonjour, Aminata",
      balance: "Votre solde",
      balanceAmount: "42 500 XOF",
      topUp: "Recharger",
      request: "Demander",
      pay: "Payer",
      vault: "Coffre hors ligne",
      vaultAmount: "18 000 XOF",
      ready: "Prêt hors ligne",
      expires: "Expire le 2 oct.",
      activity: "Activité récente",
      seeAll: "Tout voir",
      rows: [
        { title: "Payé Étal du marché", date: "Aujourd'hui, 09:12", amount: "−1 500 XOF", incoming: false, pending: "En attente" },
        { title: "De Kofi", date: "Aujourd'hui, 08:05", amount: "+5 000 XOF", incoming: true, pending: "" },
        { title: "Payé Pharmacie", date: "Hier", amount: "−3 200 XOF", incoming: false, pending: "" },
      ],
      home: "Accueil",
    },
  },

  flow: {
    title: "Un paiement, deux scans, aucun réseau",
    lead: "Le commerçant et le payeur n'ont besoin ni d'une connexion entre eux, ni d'un serveur.",
    merchant: "Commerçant",
    payer: "Payeur",
    anyone: "L'un ou l'autre",
    steps: [
      {
        actor: "merchant",
        title: "Afficher la demande",
        body: "L'appareil du commerçant affiche un QR avec le montant, la devise et un numéro de demande à usage unique.",
      },
      {
        actor: "payer",
        title: "Scanner et confirmer",
        body: "Le payeur scanne, voit le montant et confirme avec son code PIN.",
      },
      {
        actor: "payer",
        title: "Signer et afficher",
        body: "Le téléphone signe le paiement avec sa clé protégée par le matériel et affiche un QR de paiement.",
      },
      {
        actor: "merchant",
        title: "Vérifier en moins d'une seconde",
        body: "Le commerçant scanne et contrôle tout hors ligne : signature de l'émetteur, signature du payeur, plafonds, rejeu et chaîne.",
      },
      {
        actor: "anyone",
        title: "Synchroniser dès qu'il y a du réseau",
        body: "Le premier appareil connecté envoie les données. Le règlement suit vers le grand livre du partenaire.",
      },
    ],
  },

  layers: {
    title: "Sept couches, une mission chacune",
    lead: "Un protocole compact et auditable. Chaque couche peut être revue, testée et remplacée séparément.",
    items: [
      { name: "Identité et clés", body: "Une paire de clés dans le module de sécurité de l'appareil, attestée à l'enrôlement." },
      { name: "Allocation", body: "Un certificat signé par le partenaire : clé de l'appareil, plafond, devise, expiration, identifiant d'allocation." },
      { name: "Paiement", body: "Un paiement signé par le payeur, avec numéro de séquence, cumul dépensé et empreinte du paiement précédent." },
      { name: "Transport", body: "QR d'abord. NFC et Bluetooth ensuite. Solutions de repli SMS et USSD prévues." },
      { name: "File d'attente et synchro", body: "Une file durable et chiffrée qui envoie les données dès qu'un appareil capte le réseau." },
      { name: "Rapprochement et risque", body: "Dédoublonnage, détection des bifurcations, plafonds et règles de vélocité, révocation des clés." },
      { name: "Règlement", body: "Des lots vers le grand livre du partenaire, les rails nationaux ou PAPSS pour le transfrontalier." },
    ],
  },

  twoLayers: {
    eyebrow: "Deux couches, une seule intégration",
    title: "La fiabilité d'abord. L'acceptation hors ligne garantie par-dessus.",
    visual: { queued: "En file", available: "Disponible hors ligne", funded: "Votre argent", overdraft: "Découvert" },
    lead: "Une infrastructure de transactions hors ligne à risque maîtrisé et à rapprochement automatique. Commencez par la couche de fiabilité, puis ajoutez l'acceptation garantie là où elle est rentable.",
    reliability: {
      tag: "Couche A",
      title: "Couche de fiabilité",
      body: "Protège chaque transaction pendant la perte de connectivité, quel que soit le moyen de paiement utilisé en dessous.",
      statesLabel: "Machine à états de connectivité",
      states: ["En ligne", "Dégradé", "Hors ligne", "Reconnexion", "Rapprochement", "Réglé"],
      points: [
        "File locale durable sur l'appareil",
        "Enveloppes de transaction signées et idempotentes",
        "Reprise automatique avec délai croissant",
        "Détection des doublons et des conflits",
        "Rapprochement avec votre grand livre",
        "Tableau de bord de supervision dans la Console partenaire",
      ],
    },
    acceptance: {
      tag: "Couche B",
      title: "Acceptation hors ligne garantie",
      body: "Permet à un commerçant d'accepter un paiement sans réseau, avec un risque borné et tarifé.",
      points: [
        "Coffre hors ligne préalimenté, bloqué chez le partenaire",
        "Découvert hors ligne en option par-dessus",
        "Le commerçant vérifie hors ligne en moins d'une seconde",
        "Risque borné par les plafonds, limites et expiration",
        "Double dépensement détecté comme bifurcation au rapprochement, puis recouvré",
      ],
    },
  },

  home: {
    hero: {
      eyebrow: "L'infrastructure de paiement pour les réseaux instables.",
      line1: "Pas de réseau.",
      line2: "Payé quand même.",
      lead: "Des paiements et du paiement différé qui n'attendent pas le réseau. PayVault est une infrastructure de transactions hors ligne à risque maîtrisé et à rapprochement automatique, pour les PSP, les réseaux de TPE, les banques et les opérateurs de mobile money.",
      fine: "Proposé en tant que service aux partenaires agréés. PayVault n'est ni une banque ni un portefeuille et ne détient jamais les fonds des clients.",
      short: "Paiements hors ligne et paiement différé pour banques, PSP et mobile money. Réglés automatiquement au retour du réseau.",
      stagePartners: "Pour les partenaires",
      stagePartnersTitle: "L'acceptation hors ligne, réglée dans votre propre grand livre.",
      stageCustomers: "Pour vos clients",
      stageCustomersTitle: "Un portefeuille qui paie sans réseau.",
      floatTitle: "Paiement reçu",
      floatMeta: "Hors ligne · Étal du marché",
    },
    numbers: {
      title: "Le hors-ligne en chiffres.",
      packs: "Packs pays configurés, du Sénégal au Kenya",
      bytes: "Un paiement signé. Il tient dans un seul QR code.",
      bars: "Barres de réseau nécessaires à la caisse",
      languages: "Langues dans l'app, la documentation et la console",
      note: "Les packs pays sont au stade de concept. Les limites sont illustratives, pas des agréments réglementaires.",
    },
    tagline: {
      title: "Payez hors ligne. Réglez plus tard. Ne perdez rien.",
      items: [
        {
          title: "Payez hors ligne",
          body: "Le payeur et le commerçant échangent deux QR codes. Pas de serveur, pas de données, pas d'attente d'une barre de réseau.",
        },
        {
          title: "Réglez plus tard",
          body: "Les paiements attendent en sécurité dans l'appareil. Le premier appareil connecté synchronise pour les deux.",
        },
        {
          title: "Ne perdez rien",
          body: "Le commerçant est garanti pour tout paiement qui passe les contrôles hors ligne. La fraude est détectée et recouvrée.",
        },
      ],
    },
    problem: {
      eyebrow: "Le problème",
      title: "Les réseaux tombent. Le commerce ne s'arrête pas.",
      body: "Marchés, bus, dispensaires ruraux et postes frontières continuent de travailler quand le signal disparaît. Aujourd'hui, ces ventes sont perdues, retardées, ou faites en espèces que personne ne peut tracer. Les partenaires perdent des transactions et les clients perdent confiance.",
      points: [
        { title: "Ventes perdues", body: "Un client qui a de l'argent sur son compte ne peut pas payer quand le terminal n'atteint pas le serveur." },
        { title: "Les espèces par défaut", body: "Les espèces sont le plan B hors ligne : impossibles à tracer, risquées à transporter et hors de votre écosystème." },
        { title: "Il manque quelques pièces", body: "Le client est un peu juste, le réseau est coupé et la vente s'envole. Aujourd'hui, le paiement différé exige une connexion." },
      ],
    },
    flowEyebrow: "Comment ça marche",
    payLater: {
      eyebrow: "Découvert hors ligne",
      title: "Payez plus tard, même sans réseau.",
      body: "En plus du coffre provisionné, votre partenaire peut accorder une petite ligne de crédit dans la même allocation. Les clients continuent de payer quand leur solde est court, sans dépendre du réseau.",
      points: [
        "La valeur provisionnée est dépensée d'abord, puis le découvert.",
        "Après synchronisation, le découvert devient un prêt à court terme avec des frais et une échéance, par exemple 14 jours.",
        "Il est remboursé automatiquement à partir des fonds entrants.",
        "La limite dépend du niveau KYC du client et de son historique de remboursement.",
      ],
      cta: "Découvrir le paiement différé",
    },
    audience: {
      eyebrow: "Pour qui",
      title: "Conçu pour les entreprises qui font déjà tourner les paiements.",
      lead: "Vous gardez le client, la marque, l'agrément et les fonds. PayVault fournit en dessous la fiabilité et les rails hors ligne.",
      items: [
        { title: "PSP et réseaux de TPE", body: "Gardez vos terminaux actifs pendant les coupures et rapprochez automatiquement au retour du réseau." },
        { title: "Banques", body: "L'acceptation hors ligne pour vos commerçants et vos utilisateurs d'application, dans votre propre grand livre." },
        { title: "Opérateurs de mobile money", body: "Gardez agents et commerçants actifs pendant les coupures de réseau." },
        { title: "Plateformes marchandes et chaînes de distribution", body: "Encaissez en magasin et sur les points de vente éphémères, même mal couverts." },
        { title: "Billettique de transport", body: "Des titres de transport qui fonctionnent sur des bus et bateaux hors ligne toute la journée." },
        { title: "Écoles et réseaux d'agents de terrain", body: "Frais de scolarité, collecte et distribution d'espèces dans les zones mal connectées." },
      ],
    },
    honest: {
      eyebrow: "Honnête par conception",
      title: "Le double dépensement hors ligne est borné, détecté et recouvré.",
      body: "Aucun système ne peut empêcher totalement un téléphone cloné de dépenser deux fois hors ligne. Nous ne prétendons pas le contraire. Nous le rendons difficile, nous plafonnons les dégâts et nous le détectons toujours.",
      items: [
        { title: "Borné", body: "Plafonds, limites et expiration : au pire, on ne peut doubler que sa propre allocation." },
        { title: "Détecté", body: "Un double dépensement casse la chaîne de hachage. Au rapprochement, il apparaît comme une bifurcation cryptographique, avec les deux paiements signés comme preuve." },
        { title: "Recouvré", body: "La clé est révoquée, le commerçant est quand même payé par un fonds de garantie, et la perte est recouvrée auprès du titulaire identifié (KYC)." },
      ],
      cta: "Lire le modèle de sécurité",
    },
    surfaces: {
      eyebrow: "Produit",
      title: "Un protocole, quatre interfaces.",
      items: [
        { title: "Application de référence", body: "Une PWA portefeuille et commerçant en marque blanche, que les partenaires peuvent déployer ou utiliser comme modèle.", status: "Disponible" },
        { title: "Console partenaire", body: "Exposition, rapprochement, alertes de bifurcation et configuration pays.", status: "Disponible" },
        { title: "API REST et webhooks", body: "Émettez des allocations, synchronisez les paiements, recevez des événements.", status: "Disponible" },
        { title: "SDK", body: "Web dès maintenant. Android, iOS et USSD/SIM prévus.", status: "Web disponible" },
      ],
    },
    coverage: {
      eyebrow: "Couverture",
      title: "Panafricain par configuration, pas par réécriture.",
      body: "Les règles de chaque pays vivent dans des données que nous appelons Country Packs : devise, plafonds, niveaux KYC, rails et protection des données. Ouvrir un marché relève de la configuration et du partenariat.",
      countries: "pays configurés",
      currencies: "devises",
      regions: "régions",
      note: "Tous les packs sont au stade concept. Les plafonds sont illustratifs et ne constituent pas des autorisations réglementaires.",
      cta: "Voir la couverture",
    },
    cta: {
      title: "Pas de réseau. Payé quand même.",
      body: "Parlez-nous de votre marché. Nous menons des pilotes avec un petit nombre de partenaires agréés.",
    },
  },

  howItWorks: {
    hero: {
      eyebrow: "Comment ça marche",
      title: "Deux scans.|Zéro barre.",
      lead: "Le téléphone du payeur signe. Celui du marchand vérifie. Le réseau suit plus tard.",
    },
    lifecycle: {
      title: "La vie d'une allocation",
      steps: [
        {
          title: "Bloquer",
          body: "L'utilisateur transfère une partie de son solde dans un Coffre hors ligne chez son partenaire. Cette valeur est réservée chez le partenaire et ne peut pas être dépensée ailleurs.",
        },
        {
          title: "Certifier",
          body: "Le partenaire signe un certificat d'allocation lié à la clé du téléphone de l'utilisateur (ECDSA P-256). Il indique le plafond, la devise et l'expiration.",
        },
        {
          title: "Dépenser",
          body: "Le téléphone signe chaque paiement. La valeur provisionnée est utilisée d'abord, puis le découvert éventuel accordé par le partenaire.",
        },
        {
          title: "Rapprocher",
          body: "Les paiements se synchronisent, les doublons et bifurcations sont contrôlés et le règlement est produit. La valeur inutilisée est libérée après le délai de grâce.",
        },
      ],
    },
    verify: {
      title: "Ce que le commerçant vérifie, hors ligne, en moins d'une seconde",
      lead: "Tout ce qui suit s'exécute sur l'appareil du commerçant, avec les clés d'émetteur en cache et la dernière liste de révocation synchronisée.",
      checks: [
        "La signature de l'émetteur sur le certificat d'allocation",
        "L'allocation n'est ni expirée ni révoquée, selon la dernière synchronisation",
        "La signature du payeur sur le paiement",
        "L'identifiant du commerçant et le numéro de demande correspondent à cette vente",
        "La devise correspond et le cumul reste sous le plafond",
        "La séquence et le cumul sont cohérents avec les paiements précédents de cette allocation",
        "L'empreinte du paiement précédent prolonge bien la chaîne",
      ],
    },
    doubleSpend: {
      title: "Que se passe-t-il en cas de triche",
      body: "Le double dépensement hors ligne ne peut pas être empêché avec certitude. On peut le rendre difficile, le borner, le détecter et le recouvrer. Voici chaque défense et ce qu'elle apporte.",
      head: { defence: "Défense", effect: "Effet" },
      rows: [
        { defence: "Clés d'appareil non exportables (protégées par le matériel et attestées dans les SDK natifs, prévu)", effect: "Extraire une clé est difficile ; cloner un appareil entier est contenu par les plafonds et la détection des bifurcations." },
        { defence: "Plafond d'allocation, limite par transaction, expiration", effect: "Plafonne la perte maximale." },
        { defence: "Paiements chaînés et numérotés", effect: "Tout double dépensement devient une bifurcation détectable." },
        { defence: "Contrôles de cohérence côté commerçant", effect: "Bloque les rejeux naïfs chez le même commerçant." },
        { defence: "Liste de révocation synchronisée aux commerçants", effect: "Arrête un fraudeur connu dès que les commerçants se synchronisent." },
        { defence: "Titulaire d'allocation identifié (KYC)", effect: "La perte est recouvrée auprès du fraudeur." },
        { defence: "Garantie du fonds de risque", effect: "Le commerçant est payé quoi qu'il arrive." },
      ],
    },
    sync: {
      title: "La synchro se fait dès que quelqu'un capte le réseau",
      body: "Le commerçant n'a pas besoin d'être celui qui se connecte. L'un ou l'autre appareil peut envoyer le paiement signé, et comme chaque paiement est déjà signé, le relayer ne peut pas le modifier.",
      points: [
        { title: "Les deux parties peuvent régler", body: "Si l'appareil du commerçant tombe en panne avant la synchro, la copie du payeur peut encore être envoyée." },
        { title: "Règlement à votre façon", body: "Les lots vont vers votre grand livre hébergé ou externe via l'API et les webhooks, vers les rails nationaux, ou via PAPSS pour le transfrontalier." },
      ],
    },
    cta: { title: "Essayez-le sur votre propre réseau.", body: "Un pilote peut démarrer dans un sandbox avec de l'argent de test." },
  },

  product: {
    hero: {
      eyebrow: "Produit",
      title: "Votre marque.|Nos rails hors ligne.",
      lead: "Un portefeuille, une console, un SDK et une API qui tournent dans votre grand livre.",
    },
    surfaces: [
      {
        title: "Application de référence (PWA en marque blanche)",
        status: "Disponible",
        body: "Une application web progressive avec un mode portefeuille pour les payeurs et un mode commerçant pour l'encaissement. Les partenaires peuvent la déployer sous leur propre marque ou s'en servir de modèle pour leurs applications. Ce n'est pas une marque grand public.",
        bullets: ["Solde du Coffre hors ligne et du découvert", "Payer, demander et scanner avec la caméra", "File du commerçant avec état de synchro"],
      },
      {
        title: "Console partenaire",
        status: "Disponible",
        body: "L'endroit où les équipes risque, finance et opérations voient ce qui se passe et configurent le comportement du service.",
        bullets: ["Exposition hors ligne en cours et paiements en attente de synchro", "Rapprochement et règlement", "Alertes de bifurcation avec les deux paiements signés en conflit", "Configuration des Country Packs et des plafonds"],
      },
      {
        title: "API REST v1 et webhooks",
        status: "Disponible",
        body: "Émettez des allocations, recevez les paiements synchronisés et obtenez des événements dans vos propres systèmes. Votre grand livre reste la référence.",
        bullets: ["Requêtes idempotentes", "Événements webhook signés", "Grand livre hébergé ou externe"],
      },
      {
        title: "SDK",
        status: "Web disponible. Android, iOS et USSD/SIM prévus.",
        body: "Intégrez le paiement hors ligne dans votre propre application. Le SDK Web est disponible dès maintenant. Les SDK natifs utiliseront le module de sécurité matériel de chaque plateforme.",
        bullets: ["SDK Web", "Android (prévu)", "iOS (prévu)", "USSD / SIM (prévu)"],
      },
    ],
    nonCustodial: {
      eyebrow: "Sans détention de fonds par conception",
      title: "Votre agrément. Vos fonds. Nos rails.",
      body: "PayVault est un prestataire de services technologiques. Ce n'est ni une banque ni un portefeuille. Il ne détient jamais les fonds des clients.",
      partnerTitle: "Le partenaire",
      partner: ["Détient l'agrément et la relation client", "Détient les fonds et le grand livre", "Réalise le KYC et fixe les plafonds", "Fixe les conditions et frais du découvert"],
      payvaultTitle: "PayVault",
      payvault: ["Exploite le protocole hors ligne et les SDK", "Rapproche et détecte les bifurcations", "Gère le fonds de risque et la garantie", "Produit les lots de règlement"],
    },
    cta: { title: "Essayez le sandbox.", body: "Gratuit, avec de l'argent de test. Sans engagement." },
  },

  payLater: {
    hero: {
      eyebrow: "Découvert hors ligne",
      title: "Un peu juste à la caisse ?|Payez quand même.",
      lead: "Un petit découvert dans le coffre, remboursé au prochain dépôt.",
    },
    how: {
      title: "Comment ça marche",
      steps: [
        { title: "Accorder", body: "Votre partenaire ajoute un découvert à l'allocation du client, dimensionné selon le niveau KYC et l'historique de remboursement." },
        { title: "Dépenser", body: "La valeur provisionnée est utilisée d'abord. Le paiement n'entame le découvert que lorsqu'elle est épuisée." },
        { title: "Synchroniser", body: "Quand le paiement atteint le serveur, le montant du découvert devient un prêt à court terme avec des frais et une échéance." },
        { title: "Rembourser", body: "Le prêt est remboursé automatiquement à partir des fonds entrants, par exemple le prochain dépôt du client." },
      ],
    },
    example: {
      title: "Un exemple concret",
      note: "Chiffres illustratifs. Les frais, conditions et plafonds sont fixés par le partenaire.",
      rows: [
        { label: "Coffre provisionné", value: "10 000" },
        { label: "Découvert accordé", value: "3 000" },
        { label: "Achat au marché", value: "11 500" },
        { label: "Payé avec la valeur provisionnée", value: "10 000" },
        { label: "Payé avec le découvert", value: "1 500" },
        { label: "Après synchro", value: "Prêt à court terme de 1 500 plus frais, échéance à 14 jours" },
      ],
    },
    limit: {
      title: "Ce qui fixe la limite de crédit",
      items: [
        { title: "Niveau KYC", body: "Plus la vérification est poussée, plus le plafond est haut. Les niveaux sont définis par pays dans le Country Pack." },
        { title: "Historique de remboursement", body: "Les clients qui remboursent à temps voient leur limite augmenter. Les impayés la réduisent." },
        { title: "Politique du partenaire", body: "Votre équipe risque fixe les plafonds, les frais, les échéances et les clients éligibles." },
      ],
    },
    guardrails: {
      title: "Garde-fous",
      items: [
        "Le découvert est inclus dans le plafond de l'allocation : l'exposition est bornée dès le départ.",
        "Chaque paiement hors ligne est signé et chaîné, donc l'obligation de remboursement est prouvable.",
        "L'usage du découvert est visible dans la Console partenaire, par client et par pays.",
        "Le crédit est accordé par votre établissement agréé. PayVault fournit la mécanique, pas le prêt.",
      ],
    },
    lender: {
      title: "Votre établissement est le prêteur de référence",
      body: "Le partenaire agréé accorde le crédit, porte le prêt et supporte le risque de crédit. PayVault fournit la décision, les plafonds et le suivi des remboursements. PayVault ne prête pas et ne détient pas les fonds des clients.",
    },
    cta: { title: "Ajoutez le paiement différé à vos paiements hors ligne.", body: "Nous dimensionnerons un modèle de découvert avec votre équipe risque." },
  },

  useCases: {
    hero: {
      eyebrow: "Cas d'usage",
      title: "Du marché|au danfo.",
      lead: "Là où le réseau tombe, la vente passe quand même.",
    },
    labels: { scenario: "Scénario", benefit: "Ce qui change" },
    cases: [
      {
        title: "PSP et réseaux de TPE ou de terminaux",
        scenario: "Les terminaux perdent leur liaison avec le switch plusieurs fois par jour, et chaque tentative échouée est une vente perdue ou dupliquée.",
        benefit: "Une file locale durable, des transactions signées et idempotentes et une reprise automatique gardent le terminal actif et rapprochent sans doublons.",
      },
      {
        title: "Banques",
        scenario: "Les paiements par carte et par application échouent chez les commerçants quand la liaison du TPE tombe.",
        benefit: "Acceptez les paiements hors ligne de vos propres clients, avec les plafonds et le KYC que vous maîtrisez.",
      },
      {
        title: "Opérateurs de mobile money",
        scenario: "Une panne régionale coupe les données dans une ville de marché. Agents et commerçants ne peuvent plus transiger.",
        benefit: "Les clients paient depuis un Coffre hors ligne. Les commerçants vérifient sur place et règlent dans votre grand livre après la panne.",
      },
      {
        title: "Plateformes marchandes et chaînes de distribution",
        scenario: "Votre application commerçant doit continuer d'encaisser en magasin et sur les points de vente éphémères mal couverts.",
        benefit: "Intégrez le SDK, appelez l'API REST et recevez les événements de rapprochement par webhook.",
      },
      {
        title: "Billettique de transport",
        scenario: "Un bus rural reste hors ligne toute la journée, et les passagers ont peu d'espèces.",
        benefit: "Les titres de transport sont signés et vérifiés à bord. Le téléphone d'un passager peut synchroniser en premier et relayer pour le receveur.",
      },
      {
        title: "Paiements scolaires",
        scenario: "Les parents paient frais de scolarité et cantine là où le bureau de l'économat a une connexion peu fiable.",
        benefit: "Les paiements sont acceptés sur place et rapprochés vers le compte de l'école au retour du réseau.",
      },
      {
        title: "Réseaux d'agents de terrain et transferts monétaires",
        scenario: "Des agents et des équipes humanitaires collectent ou distribuent des espèces dans des zones où la connexion est intermittente pendant des jours.",
        benefit: "Les bénéficiaires détiennent une allocation plafonnée, achètent chez les commerçants locaux, et ceux-ci sont payés dès que quelqu'un synchronise.",
      },
      {
        title: "Commerçants transfrontaliers",
        scenario: "Des commerçants à une frontière terrestre doivent payer d'une devise à l'autre avec un mauvais signal.",
        benefit: "Les paiements attendent hors ligne et se règlent plus tard via PAPSS lorsque le corridor le permet. C'est une phase ultérieure.",
      },
    ],
    cta: { title: "Vous avez un scénario en tête ?", body: "Décrivez-le, nous vous dirons honnêtement si PayVault convient." },
  },

  coverage: {
    hero: {
      eyebrow: "Couverture",
      title: "Quinze marchés.|Des règles pour chacun.",
      lead: "Devise, plafonds, KYC et rails par pays, sous forme de données. Tous au stade concept.",
    },
    stats: { countries: "Pays", currencies: "Devises", regions: "Régions", concept: "Au stade concept" },
    explorer: { all: "Toutes", hint: "Choisissez un pays ou une région" },
    regions: {
      west: "Afrique de l'Ouest",
      east: "Afrique de l'Est",
      central: "Afrique centrale",
      southern: "Afrique australe",
      north: "Afrique du Nord",
    },
    status: { concept: "Concept", pilot_ready: "Prêt pour pilote", live: "En production" },
    card: {
      currency: "Devise",
      perTransaction: "Par paiement",
      allowanceCap: "Plafond d'allocation",
      rails: "Rails nationaux",
      centralBank: "Banque centrale",
      dataLaw: "Protection des données",
      papss: "PAPSS",
      papssYes: "Transfrontalier via PAPSS",
      bloc: "Zone",
      residency: { none: "Pas d'obligation de localisation", preferred: "Hébergement local préféré", required: "Hébergement local obligatoire" },
    },
    notice: {
      title: "Ce que signifie le stade concept",
      body: "Les plafonds affichés sont des points de départ illustratifs. Ce ne sont pas des autorisations réglementaires, et aucun pays n'est en production. Passer un pack en « prêt pour pilote » suppose de convenir des plafonds avec un partenaire agréé et son régulateur.",
    },
    what: {
      title: "Ce que contient un Country Pack",
      items: [
        "Devise, subdivisions et symbole",
        "Limite par paiement, plafond d'allocation, durée de vie de l'allocation et nombre de paiements",
        "Niveaux KYC et part du plafond autorisée à chaque niveau",
        "Rails de paiement nationaux et options transfrontalières",
        "Langues, format des numéros de téléphone et systèmes d'identité nationaux",
        "Loi de protection des données, autorité et niveau de localisation des données",
      ],
    },
    cta: { title: "Vous ne voyez pas votre marché ?", body: "Ouvrir un pays relève surtout de la configuration et d'une discussion avec un partenaire." },
  },

  developers: {
    hero: {
      eyebrow: "Développeurs",
      title: "Deux appels.|Le hors ligne en production.",
      lead: "Émettez un coffre, synchronisez, écoutez les événements. Votre grand livre garde la main.",
    },
    steps: [
      { title: "Émettre une allocation", body: "Votre backend demande à PayVault de signer une allocation pour la clé de l'appareil d'un utilisateur, après avoir bloqué les fonds dans votre grand livre." },
      { title: "Synchroniser les paiements", body: "Les appareils envoient les paiements signés et chaînés dès qu'ils captent le réseau. Vous récupérez les résultats : acceptés, doublons et bifurcations." },
      { title: "Écouter les événements", body: "Les webhooks indiquent à votre grand livre quand régler, recouvrer ou révoquer." },
    ],
    codeTitle: "Deux appels pour démarrer",
    codeNote: "Les formats de requête sont donnés à titre indicatif. Consultez la documentation pour la référence à jour.",
    codeLabels: { issue: "Émettre une allocation", sync: "Synchroniser les paiements", webhook: "Événement webhook" },
    sdk: {
      title: "SDK",
      items: [
        { name: "SDK Web", status: "Disponible" },
        { name: "Android (Kotlin)", status: "Prévu" },
        { name: "iOS (Swift)", status: "Prévu" },
        { name: "USSD / SIM", status: "Prévu" },
      ],
    },
    principles: {
      title: "Pensé pour les intégrateurs",
      items: [
        "Synchronisation des paiements idempotente : les nouvelles tentatives sont sans danger",
        "Webhooks signés avec protection contre le rejeu",
        "Sandbox avec argent de test et la même API",
        "Montants en entiers, dans la plus petite unité monétaire",
      ],
    },
    cta: { title: "Démarrez dans le sandbox.", body: "Gratuit, avec de l'argent de test." },
  },

  security: {
    hero: {
      eyebrow: "Sécurité",
      title: "La double dépense existe.|Nous la détectons.",
      lead: "Bornée par les plafonds, détectée au règlement, recouvrée auprès du titulaire.",
    },
    custody: {
      title: "Sans détention de fonds par conception",
      body: "PayVault ne détient jamais les fonds des clients. La valeur est bloquée chez votre établissement, et le certificat d'allocation ne fait qu'autoriser sa dépense. Si PayVault disparaissait demain, l'argent de vos clients resterait dans votre grand livre.",
    },
    threats: {
      title: "Synthèse du modèle de menaces",
      head: { threat: "Menace", mitigation: "Parade" },
      rows: [
        { threat: "Appareil cloné ou clé extraite", mitigation: "Clés non exportables (module matériel et attestation prévus dans les SDK natifs), plafonds bas, détection des bifurcations et révocation." },
        { threat: "Rejeu chez le même commerçant", mitigation: "Numéro de demande à usage unique et contrôles de séquence." },
        { threat: "Rejeu chez un autre commerçant", mitigation: "Chaque paiement est lié à un identifiant de commerçant." },
        { threat: "Retour en arrière du compteur sur l'appareil", mitigation: "La chaîne de hachage transforme un retour en arrière en bifurcation que le rapprochement détecte." },
        { threat: "Faux paiement fabriqué par un commerçant", mitigation: "Impossible sans la clé privée du payeur." },
        { threat: "Téléphone perdu ou volé", mitigation: "PIN avant signature. L'allocation restante est exposée comme des espèces, elle est plafonnée, et la clé peut être révoquée." },
        { threat: "Allocation expirée ou révoquée", mitigation: "Contrôlée hors ligne selon la dernière liste synchronisée. Le risque dans la fenêtre de synchro est accepté et borné." },
        { threat: "Contrainte et arnaques", mitigation: "Plafonds hors ligne bas et paiements liés au commerçant." },
        { threat: "Perte de données du commerçant avant synchro", mitigation: "File durable et chiffrée. Le payeur conserve une copie et peut aussi la synchroniser." },
      ],
    },
    crypto: {
      title: "Choix cryptographiques",
      items: [
        { name: "ECDSA P-256", body: "Pris en charge nativement par le Secure Enclave d'iOS et le StrongBox d'Android : les clés restent dans le matériel." },
        { name: "SHA-256", body: "Sert à la chaîne de hachage qui relie chaque paiement au précédent." },
        { name: "Encodage binaire à format fixe", body: "Des charges déterministes et compactes : un paiement complet fait 276 octets et tient dans un seul QR code." },
        { name: "Cryptographie de la plateforme", body: "La signature et le hachage utilisent WebCrypto, intégré à la plateforme, sans dépendance cryptographique tierce." },
        { name: "Horloges non fiables", body: "L'ordre vient des numéros de séquence. L'expiration tolère un décalage d'horloge." },
      ],
    },
    guarantee: {
      title: "La garantie du commerçant",
      body: "Un commerçant qui a accepté un paiement ayant passé tous les contrôles hors ligne est payé. Si une bifurcation est découverte plus tard, la clé est révoquée, le commerçant est payé par le fonds de risque et la perte est recouvrée auprès du titulaire identifié (KYC).",
    },
    status: {
      title: "Où nous en sommes",
      body: "PayVault en est à ses débuts. Nous n'avons pas encore réalisé d'audit de sécurité indépendant et ne détenons aucune certification. Nous publierons les résultats ici lorsque cela changera.",
    },
    cta: { title: "Vous voulez le modèle de menaces complet ?", body: "Nous le partageons avec les partenaires potentiels sous accord de confidentialité." },
  },

  metrics: {
    eyebrow: "Indicateurs de pilote que nous mesurons",
    title: "Ce que la console suit pendant un pilote.",
    lead: "Ce sont les mesures que nous convenons d'emblée avec chaque partenaire. Elles décrivent ce que nous suivons, pas des résultats déjà obtenus.",
    note: "Aucun résultat n'est encore publié. Nous ne partagerons des chiffres que issus de vrais pilotes, avec l'accord du partenaire.",
    items: [
      "Part des transactions touchées par une perte de connectivité",
      "Rétablissement après la reconnexion",
      "Taux de doublons",
      "Exactitude du rapprochement",
      "Délai médian de règlement",
      "Transactions perdues",
      "Fraude hors ligne, bornée par la politique de risque",
      "Durée d'intégration",
    ],
  },

  pricing: {
    hero: {
      eyebrow: "Tarifs",
      title: "Commencez en bac à sable.|Payez ce qui est réglé.",
      lead: "Tarifs fixés avec chaque partenaire pendant le pilote. Pas encore de grille publique.",
    },
    model: {
      title: "Comment le prix se construit",
      lead: "Quatre composantes, convenues avec vous pendant le pilote. Contactez-nous pour les chiffres.",
      items: [
        { title: "Frais d'intégration", body: "Travail ponctuel pour connecter PayVault à votre grand livre, vos terminaux et votre Country Pack." },
        { title: "Frais de plateforme", body: "Frais récurrents pour la Console partenaire, la supervision, les outils de risque et l'hébergement." },
        { title: "Usage", body: "Facturé par appareil ou terminal actif, ou par transaction hors ligne réglée, selon votre modèle." },
        { title: "Support entreprise", body: "Support dédié, revues et niveaux de service pour les établissements réglementés." },
      ],
    },
    plans: [
      {
        name: "Sandbox",
        price: "Gratuit",
        note: "Argent de test uniquement",
        body: "Tout ce qu'il faut pour développer et faire des démonstrations.",
        features: ["API REST et webhooks complets", "Application web et Console partenaire", "Scénarios simulés de bifurcation et de révocation", "Argent de test, pas de règlement réel"],
        cta: "Démarrer dans le sandbox",
        featured: "",
      },
      {
        name: "Growth",
        price: "Intégration + plateforme + usage",
        note: "Contactez-nous",
        body: "Pour les partenaires qui mènent un pilote ou un premier marché.",
        features: ["Usage par appareil actif ou par transaction réglée", "Règlement réel vers votre grand livre", "Outils de découvert et de paiement différé", "Accompagnement pendant votre pilote"],
        cta: "Demander un pilote",
        featured: "Pour les pilotes",
      },
      {
        name: "Enterprise",
        price: "Sur mesure",
        note: "Contactez-nous",
        body: "Pour les programmes multi-pays et les établissements réglementés.",
        features: ["Conditions et volumes sur mesure", "Conditions du fonds de risque et de la garantie", "Support dédié et revues régulières", "Mise en place des Country Packs"],
        cta: "Parlons-en",
        featured: "",
      },
    ],
    faq: {
      title: "Bon à savoir",
      items: [
        { q: "Qu'est-ce qu'une transaction hors ligne réglée ?", a: "Un paiement fait hors ligne, synchronisé, rapproché et transmis à votre grand livre pour règlement." },
        { q: "Y a-t-il des frais de mise en place ou des minimums ?", a: "Nous les convenons ensemble pendant le pilote. Rien n'est facturé dans le Sandbox." },
        { q: "Qui fixe les frais et conditions de prêt du client ?", a: "Vous. Les frais de découvert et les échéances sont fixés par votre établissement." },
      ],
    },
    cta: { title: "Construisons un pilote ensemble.", body: "Dites-nous votre marché et vos volumes." },
  },

  about: {
    hero: {
      eyebrow: "À propos",
      title: "Conçu pour les lieux|que le réseau oublie.",
      lead: "Infrastructure de paiement hors ligne pour l'Afrique, vendue à des partenaires agréés.",
    },
    mission: {
      title: "Ce que nous construisons",
      body: "Un protocole compact et les outils qui vont avec, pour qu'une banque, un opérateur de mobile money ou une fintech puisse permettre à ses clients de payer et de payer plus tard quand le réseau est coupé, sans céder le contrôle des agréments, des fonds ni des clients.",
    },
    principles: {
      title: "Notre façon de travailler",
      items: [
        { title: "Honnêtes sur les limites", body: "Le double dépensement hors ligne ne peut pas être totalement empêché. Nous le disons et concevons pour une perte bornée." },
        { title: "Les partenaires détiennent l'agrément", body: "Nous sommes un prestataire technologique. Nous ne nous disputons pas vos clients et ne détenons pas leur argent." },
        { title: "Configuration plutôt que réécriture", body: "Chaque pays est un Country Pack, pas une version divergente du produit." },
        { title: "Petit et auditable", body: "Un protocole compact que partenaires et régulateurs peuvent réellement examiner." },
      ],
    },
    status: {
      title: "Où nous en sommes aujourd'hui",
      body: "Nous sommes à un stade précoce, entre le concept et le pilote. Tous les Country Packs sont au stade concept. Nous n'avons aucun client public et n'en revendiquerons aucun sans l'accord des partenaires.",
    },
    cta: { title: "Travaillons ensemble.", body: "Nous aimerions en savoir plus sur votre marché." },
  },

  contact: {
    hero: {
      eyebrow: "Demander un pilote",
      title: "Parlons de|votre marché.",
      lead: "Quelques informations suffisent. Nous répondons personnellement à chaque demande.",
    },
    form: {
      name: "Nom complet",
      email: "E-mail professionnel",
      organisation: "Organisation",
      organisationType: "Type d'organisation",
      country: "Pays",
      volume: "Volume mensuel de transactions",
      message: "Comment utiliseriez-vous PayVault ?",
      choose: "Sélectionner…",
      submit: "Envoyer la demande",
      sending: "Envoi en cours…",
      required: "Obligatoire",
      successTitle: "Merci. Nous avons bien reçu votre demande.",
      successBody: "Nous vous répondrons prochainement à votre adresse professionnelle.",
      errorTitle: "Nous n'avons pas pu envoyer votre demande.",
      errorBody: "Vérifiez le formulaire et réessayez, ou réessayez dans un instant.",
      another: "Envoyer une autre demande",
      privacy: "Nous utilisons ces informations uniquement pour répondre à votre demande.",
      invalidEmail: "Saisissez une adresse e-mail valide.",
    },
    orgTypes: [
      { value: "bank", label: "Banque" },
      { value: "mmo", label: "Opérateur de mobile money" },
      { value: "fintech", label: "Fintech" },
      { value: "psp", label: "PSP ou réseau de TPE" },
      { value: "platform", label: "Plateforme marchande ou distributeur" },
      { value: "ngo", label: "ONG ou réseau d'agents de terrain" },
      { value: "transit", label: "Transport ou billettique" },
      { value: "government", label: "Administration publique" },
      { value: "other", label: "Autre" },
    ],
    volumes: [
      { value: "unknown", label: "Je ne sais pas encore" },
      { value: "lt-10k", label: "Moins de 10 000" },
      { value: "10k-100k", label: "De 10 000 à 100 000" },
      { value: "100k-1m", label: "De 100 000 à 1 million" },
      { value: "gt-1m", label: "Plus d'un million" },
    ],
    aside: {
      title: "Et ensuite",
      items: [
        "Nous lisons chaque demande.",
        "Nous fixons un court appel pour comprendre votre marché et votre situation d'agrément.",
        "Nous vous ouvrons le Sandbox, puis nous construisons un pilote.",
      ],
    },
  },
};

export default site;

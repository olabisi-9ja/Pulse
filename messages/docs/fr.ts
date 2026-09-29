/** French copy for the developer docs. Typed against the English catalog. */
import type { Block, DocsMessages } from "./en";

export const fr: DocsMessages = {
  shell: {
    docs: "Docs",
    skip: "Aller au contenu",
    menu: "Ouvrir la navigation",
    closeMenu: "Fermer la navigation",
    navLabel: "Documentation",
    switchTo: "English",
    switchLabel: "Lire la documentation en anglais",
    prev: "Précédent",
    next: "Suivant",
    copy: "Copier",
    copied: "Copié",
    englishOnly: "Cette page est disponible en anglais pour le moment.",
    groups: { start: "Démarrer", reference: "Référence", guides: "Guides" },
  },
  pages: {
    intro: {
      title: "Introduction",
      description: "Ce qu'est PayVault, les deux couches qu'il apporte, à qui il s'adresse et comment l'essayer dans le bac à sable.",
    },
    concepts: {
      title: "Concepts",
      description: "Le vocabulaire du paiement hors ligne : allocations, valeur préfinancée et découvert, chaînes, relevés de clôture et fonds de risque.",
    },
    quickstart: {
      title: "Démarrage rapide",
      description: "Émettre une allocation, vérifier un paiement hors ligne et le rapprocher, en sept étapes avec un registre externe.",
    },
    protocol: {
      title: "Protocole",
      description: "Le format sur le fil : positions des octets de chaque message, encodage QR, règles de vérification et de rapprochement.",
    },
    api: {
      title: "Référence de l'API",
      description: "API REST v1 pour les partenaires : authentification, erreurs et chaque point d'accès avec exemples.",
    },
    webhooks: {
      title: "Webhooks et événements",
      description: "Types d'événements et contenus, vérification de la signature HMAC, reprises et alternative en lecture.",
    },
    sdk: {
      title: "SDK",
      description: "Utiliser @payvault/protocol dans une application web, React Native ou Node.",
    },
    overdraft: {
      title: "Découvert hors ligne",
      description: "Le paiement différé hors ligne : limites, frais, remboursement, et pourquoi le partenaire est le prêteur.",
    },
    countries: {
      title: "Packs pays",
      description: "La configuration par pays : devise, limites hors ligne, niveaux KYC, rails et cadre de protection des données.",
    },
    security: {
      title: "Sécurité",
      description: "Le modèle de menaces, le stockage des clés et ce que PayVault ne prétend pas.",
    },
  },

  intro: {
    eyebrow: "Documentation développeur",
    title: "Des paiements qui continuent quand le réseau lâche",
    lead: "PayVault est une infrastructure de paiement pour les réseaux peu fiables. Votre application peut accepter et effectuer des paiements sans signal, avec un risque fixé à l'avance, et tout est rapproché et réglé au retour de la connexion.",
    blocks: [
      {
        id: "what",
        title: "Ce qu'est PayVault",
        paras: [
          "PayVault est une couche technologique B2B pour les banques, les opérateurs de mobile money, les fintechs, les prestataires de services de paiement et les agences humanitaires en Afrique. Vous gardez vos clients, votre marque et votre registre. PayVault fournit le protocole hors ligne, la bibliothèque cliente, le rapprochement côté serveur et les événements qui indiquent à vos systèmes quoi régler.",
          "En production, le partenaire agréé est le dépositaire des fonds et le prêteur de référence pour tout découvert. L'application de référence de ce dépôt inclut aussi un registre hébergé de bac à sable, pour essayer le parcours complet sans registre propre.",
        ],
      },
      {
        id: "layers",
        title: "Deux couches",
        paras: [
          "La couche 1 est la fiabilité. Chaque paiement est un message signé et chaîné par hachage, conservé durablement sur l'appareil, transmis par code QR, envoyé dès que quelqu'un a du signal, et dédoublonné par le serveur. Un paiement peut être rejoué, relayé par un coursier ou envoyé deux fois sans être compté deux fois.",
          "La couche 2 est l'acceptation hors ligne garantie. Un commerçant peut accepter un paiement sans réseau parce que la valeur sous-jacente a été bloquée à l'avance (le coffre hors ligne) et, en option, parce que le partenaire a accordé un découvert limité. Le commerçant vérifie entièrement le paiement sur l'appareil. S'il est valide, le commerçant est payé, quoi qu'il arrive ensuite.",
        ],
        callout: {
          tone: "warn",
          title: "Borné, pas impossible",
          body: "Un téléphone sans réseau ne peut pas savoir ce qu'il a dépensé ailleurs : la double dépense hors ligne ne peut donc pas être rendue impossible. PayVault la borne et la détecte. La perte est limitée au plafond d'allocation choisi par le partenaire, une seconde dépense est prouvable par deux paiements signés portant le même numéro de séquence, le commerçant est quand même payé, et la perte est recouvrée auprès du titulaire identifié du compte.",
        },
      },
      {
        id: "who",
        title: "À qui il s'adresse",
        bullets: [
          "Les opérateurs de mobile money et les réseaux d'agents qui perdent des ventes à cause des coupures.",
          "Les banques, fintechs et prestataires de paiement qui veulent l'acceptation hors ligne dans leurs applications et parcours de caisse existants.",
          "Les programmes de transferts humanitaires et publics qui paient dans des zones peu connectées.",
          "Les transports, la billetterie et les marchés, avec de nombreux petits paiements fréquents.",
        ],
      },
      {
        id: "flow",
        title: "Le parcours en cinq étapes",
        bullets: [
          "Émettre : votre serveur demande à PayVault de signer une allocation pour la clé de l'appareil d'un client, après avoir bloqué les fonds dans votre registre.",
          "Demander : l'appareil du commerçant affiche une demande de paiement sous forme de code QR.",
          "Payer : l'appareil du client signe un paiement, chaîné au précédent, et le réaffiche en code QR.",
          "Vérifier : l'appareil du commerçant contrôle signatures, limites, révocations et chaîne, hors ligne, puis accepte ou refuse.",
          "Rapprocher : dès que l'un des deux a du signal, les paiements sont envoyés. PayVault les dédoublonne, affecte chacun à la valeur préfinancée, au découvert ou au fonds de risque, détecte les bifurcations et émet des événements pour votre registre.",
        ],
      },
      {
        id: "sandbox",
        title: "Le bac à sable",
        paras: [
          "PayVault est aujourd'hui un prototype. L'API et la console accessibles fonctionnent en mode bac à sable : aucun argent réel ne circule, aucun fonds n'est détenu, et le même format de clé d'API est utilisé partout. Tous les packs pays sont marqués concept et leurs limites sont des valeurs indicatives, non validées par un régulateur.",
          "Pour essayer, créez un compte partenaire dans la console, créez une clé d'API et suivez le démarrage rapide. Dans ces pages, $PAYVAULT_URL désigne l'origine qui sert l'API.",
        ],
      },
    ] as Block[],
    nextTitle: "Pour continuer",
    next: [
      { slug: "concepts", title: "Concepts", body: "Le vocabulaire, en une page." },
      { slug: "quickstart", title: "Démarrage rapide", body: "Émettre, payer, vérifier et synchroniser en sept étapes." },
      { slug: "protocol", title: "Protocole", body: "Format sur le fil et règles, octet par octet." },
      { slug: "api", title: "Référence de l'API", body: "Tous les points d'accès partenaires." },
    ],
  },

  concepts: {
    eyebrow: "Concepts",
    title: "Le vocabulaire du paiement hors ligne",
    lead: "Dix idées expliquent presque tout dans PayVault. Les montants sont toujours des entiers exprimés dans la plus petite unité de la devise (par exemple le kobo ou le centime), et les horodatages sont en secondes Unix sur le fil.",
    blocks: [
      {
        id: "allowance",
        title: "Allocation (le coffre hors ligne)",
        paras: [
          "Une allocation est un certificat, signé par la clé d'émetteur du partenaire, qui dit : cette clé d'appareil peut dépenser jusqu'à ce montant, dans cette devise, jusqu'à cette date. Il est lié à la clé publique de l'appareil : seul cet appareil peut signer des paiements contre lui.",
          "Il porte une limite par paiement, un nombre maximal de paiements, une date d'émission, une expiration et l'identifiant de la clé d'émetteur qui l'a signé. Son corps de 82 octets est exactement ce que l'émetteur signe (voir la page Protocole).",
          "Le mot coffre désigne l'argent qui le soutient. Avant l'émission du certificat, le partenaire bloque la valeur préfinancée dans son registre. L'appareil ne détient jamais d'argent, seulement un droit signé de dépenser une valeur déjà mise de côté.",
        ],
      },
      {
        id: "funded-vs-overdraft",
        title: "Valeur préfinancée et découvert",
        paras: [
          "Le plafond de dépense d'une allocation est le montant préfinancé plus le crédit. La valeur préfinancée est l'argent du titulaire, bloqué à l'avance. Le crédit est une ligne de découvert facultative que le partenaire accorde pour le paiement différé hors ligne.",
          "La dépense puise d'abord dans la part préfinancée. Tout ce qui dépasse est un tirage de crédit, qui devient un prêt après règlement et se rembourse selon les conditions du partenaire. Le commerçant est payé en totalité dans les deux cas.",
        ],
        table: {
          head: ["", "Préfinancé", "Découvert (crédit)"],
          rows: [
            ["À qui est l'argent", "Au titulaire, bloqué avant l'émission", "Au partenaire, prêté"],
            ["Utilisé", "En premier", "Seulement au-delà du montant préfinancé"],
            ["Non dépensé à l'expiration", "Rendu au titulaire", "Simplement caduc"],
            ["Après règlement", "Rien à rembourser", "Un prêt avec des frais, dû dans le délai"],
          ],
        },
      },
      {
        id: "request",
        title: "Demande de paiement",
        paras: [
          "Le commerçant crée une demande avec son identifiant de commerçant, la devise, le montant, un nonce aléatoire de 8 octets, l'heure et un nom d'affichage de 32 octets au plus, puis l'affiche en code QR.",
          "Le nonce lie le paiement à cette demande. Un paiement signé pour une demande ne peut pas être rejoué contre une autre, et le commerçant peut refuser un nonce déjà utilisé.",
        ],
      },
      {
        id: "bundle",
        title: "Lot de paiement",
        paras: [
          "L'appareil du payeur répond par un lot : le certificat d'allocation plus le paiement signé, 276 octets au total, affiché en code QR. Comme le lot contient le certificat, le commerçant n'a besoin de rien d'autre pour le vérifier que la clé publique de l'émetteur qu'il a mise en cache plus tôt.",
          "Un lot s'authentifie lui-même. N'importe qui peut le transporter, et personne en chemin ne peut le modifier sans casser une signature.",
        ],
      },
      {
        id: "chain",
        title: "Séquence et chaîne de hachage",
        paras: [
          "Les paiements d'une même allocation sont numérotés 1, 2, 3, etc. Chacun enregistre le total cumulé dépensé et le hachage du paiement précédent. Le paiement 1 pointe vers un hachage de genèse calculé à partir du certificat lui-même.",
          "L'identifiant du paiement est formé des 16 premiers octets du SHA-256 du corps signé. Comme chaque paiement s'engage sur son prédécesseur, l'historique ne peut être ni réordonné ni modifié, et deux paiements différents portant le même numéro de séquence prouvent directement une bifurcation, c'est-à-dire une tentative de double dépense.",
        ],
        callout: {
          tone: "warn",
          title: "Enregistrer avant d'afficher",
          body: "Un appareil doit sauvegarder son nouvel état (séquence, cumul, dernier hachage) avant de livrer le paiement. S'il plante entre les deux et réutilise un numéro de séquence, un utilisateur honnête passe pour un fraudeur.",
        },
      },
      {
        id: "close",
        title: "Relevé de clôture et retrait anticipé",
        paras: [
          "Un titulaire qui ne veut plus dépenser peut faire signer à son appareil un relevé de clôture : l'identifiant de l'allocation, le dernier numéro de séquence et le cumul auquel il s'est arrêté.",
          "À réception, PayVault rend immédiatement la valeur préfinancée au-delà du total déclaré. Le reste attend l'arrivée de tous les paiements déclarés, puis l'allocation est clôturée. Un paiement au-delà de la séquence déclarée est traité comme une fraude.",
        ],
      },
      {
        id: "expiry",
        title: "Expiration et délai de grâce",
        paras: [
          "Chaque allocation expire au bout d'une durée fixée par le pack pays, par exemple 72 heures. Les commerçants et le serveur tolèrent 5 minutes de décalage d'horloge, car les horloges des téléphones ne sont pas fiables.",
          "La valeur préfinancée non dépensée retourne au titulaire après l'expiration plus 24 heures de grâce, ce qui laisse aux paiements tardifs le temps d'arriver. Un paiement qui arrive après le remboursement est quand même honoré : il est prélevé sur le portefeuille du titulaire quand le registre est hébergé, sinon sur le fonds de risque.",
        ],
      },
      {
        id: "revocation",
        title: "Clés d'émetteur et listes de révocation",
        paras: [
          "Les commerçants vérifient les certificats avec les clés publiques d'émetteur et comparent les identifiants à une liste de révocation. Les deux viennent de l'instantané réseau, GET /api/network, que les appareils mettent en cache dès qu'ils ont du signal.",
          "Une révocation n'est effective qu'une fois le commerçant synchronisé. Elle réduit la fenêtre pour une allocation connue comme frauduleuse sans jamais la fermer, d'où l'importance du plafond. Les révocations restent 30 jours dans le flux.",
        ],
      },
      {
        id: "courier",
        title: "Synchronisation par coursier",
        paras: [
          "Ce n'est pas forcément le commerçant qui envoie les paiements. Le payeur, le commerçant, un coursier ou un agent dont le téléphone a du signal peut envoyer n'importe quel lot, et le serveur enregistre son mode d'arrivée (merchant, payer, courier ou api).",
          "L'envoi est idempotent par identifiant de paiement, et une requête porte jusqu'à 500 lots. Envoyer deux fois le même lot est sans danger.",
        ],
      },
      {
        id: "guarantee",
        title: "Garantie et fonds de risque",
        paras: [
          "Tout paiement ayant passé les contrôles qu'un commerçant peut faire hors ligne est honoré envers le commerçant. Quand le serveur règle un paiement, il répartit le montant dans un ordre fixe : valeur préfinancée, puis découvert, puis recouvrement sur le portefeuille du titulaire, et seulement ensuite le fonds de risque.",
          "Le fonds de risque absorbe ce que la valeur et le crédit du titulaire n'ont pas pu couvrir, ce qui n'arrive que si le titulaire a dépensé deux fois. La perte est bornée par le plafond de l'allocation, le compte est gelé et l'allocation révoquée. Le financement et le dimensionnement du fonds relèvent d'une décision commerciale entre PayVault et le partenaire.",
        ],
        callout: {
          tone: "note",
          title: "Ce qui est garanti",
          body: "La garantie couvre un paiement qui se vérifie hors ligne avec une clé d'émetteur à jour et une liste de révocation pas trop ancienne. Elle ne couvre pas un paiement accepté sans vérification, ni un certificat révoqué avant la dernière synchronisation du commerçant et accepté quand même.",
        },
      },
    ] as Block[],
  },

  quickstart: {
    eyebrow: "Démarrage rapide",
    title: "De la clé d'API au paiement rapproché",
    lead: "Ce pas-à-pas s'adresse à un partenaire qui tient les soldes dans son propre registre (mode registre externe). Vous bloquez les fonds, PayVault signe l'allocation, les appareils paient hors ligne, et vous réglez à partir des événements.",
  },
  protocol: {
    eyebrow: "Référence",
    title: "Protocole sur le fil",
    lead: "Tous les entiers sont en gros-boutiste. Les montants sont des entiers non signés dans la plus petite unité. Les heures sont en secondes Unix. L'octet de version vaut 1.",
  },
  api: {
    eyebrow: "Référence",
    title: "Référence de l'API, v1",
    lead: "L'API partenaire est du JSON sur HTTPS. Les valeurs binaires sont en hexadécimal (identifiants, clés publiques) ou en base64url sans remplissage (certificats, lots, relevés).",
  },
  webhooks: {
    eyebrow: "Référence",
    title: "Webhooks et événements",
    lead: "PayVault écrit un événement dans la même transaction que le changement qu'il décrit. Vous le recevez par webhook, ou vous pouvez le lire à la demande.",
  },
  sdk: {
    eyebrow: "Référence",
    title: "SDK : @payvault/protocol",
    lead: "Le paquet de protocole est en TypeScript, sans dépendance d'exécution hormis WebCrypto. Il fonctionne dans les navigateurs, sur React Native (avec une implémentation de WebCrypto) et sous Node 20+.",
  },
  overdraft: {
    eyebrow: "Guide",
    title: "Découvert hors ligne",
    lead: "Une ligne de crédit facultative dans l'allocation, pour qu'un client puisse payer hors ligne même avec un petit solde préfinancé. Le partenaire est le prêteur de référence.",
  },
  countries: {
    eyebrow: "Guide",
    title: "Packs pays",
    lead: "Un pack pays est une donnée, pas du code : il fixe la devise, les limites hors ligne, l'échelle KYC, les rails locaux et le cadre de protection des données d'un marché.",
  },
  security: {
    eyebrow: "Guide",
    title: "Sécurité",
    lead: "Ce contre quoi nous nous défendons, comment les clés sont conservées aujourd'hui et les promesses que nous ne faisons volontairement pas.",
  },
};

export default fr;

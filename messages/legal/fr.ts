import type { LegalMessages } from "./en";

const fr: LegalMessages = {
  draft: "Projet en attente de revue juridique. Ces pages décrivent le fonctionnement actuel du service de référence PayVault et évolueront avant le lancement commercial.",
  updatedLabel: "Dernière mise à jour",
  privacy: {
    title: "Politique de confidentialité",
    description: "Ce que PayVault collecte, pourquoi, où c'est stocké et vos choix.",
    updated: "29 septembre 2026",
    sections: [
      {
        title: "Qui sommes-nous",
        paras: [
          "PayVault fournit une technologie de paiement hors ligne à des partenaires agréés : banques, opérateurs de mobile money et fintechs. Lorsque vous utilisez un portefeuille fourni par un partenaire, ce partenaire est responsable de votre compte et décide de l'usage de vos données. PayVault les traite pour son compte.",
          "Pour le formulaire de demande de pilote et ce site, PayVault décide de l'usage des données. Vous pouvez nous joindre via la page contact.",
        ],
      },
      {
        title: "Ce que nous collectons",
        bullets: [
          "Compte : votre adresse e-mail, le nom saisi, votre pays, votre devise et votre langue.",
          "Vérification d'identité : le type de pièce utilisé et le niveau de vérification obtenu. Le numéro de pièce est vérifié, pas conservé.",
          "Appareil : la partie publique de la clé de signature créée sur votre téléphone et un court libellé. La clé privée ne quitte jamais votre téléphone.",
          "Paiements : montants, dates, marchand ou payeur, enregistrements hors ligne et prêts nécessaires au règlement et à la comptabilité.",
          "Demandes de pilote : le nom, l'e-mail professionnel, l'organisation et les détails envoyés via le formulaire.",
        ],
      },
      {
        title: "Ce que nous ne collectons pas",
        bullets: [
          "Aucun traceur publicitaire ni outil d'analyse tiers.",
          "Aucun suivi de localisation.",
          "Aucun numéro de carte bancaire.",
        ],
      },
      {
        title: "Pourquoi nous les utilisons",
        bullets: [
          "Faire fonctionner votre portefeuille : connexion, coffres hors ligne, règlement et découvert.",
          "Prévenir et détecter la fraude, dont la double dépense.",
          "Respecter les obligations légales du partenaire qui fournit votre portefeuille.",
          "Répondre aux demandes de pilote.",
        ],
      },
      {
        title: "Où elles sont stockées",
        paras: [
          "Les données sont stockées chez Supabase à Londres (Royaume-Uni) et le service est hébergé par Vercel. Un partenaire peut exiger un stockage dans son pays ; cela se convient au cas par cas.",
        ],
      },
      {
        title: "Cookies et stockage local",
        bullets: [
          "Un cookie de session, nécessaire pour rester connecté.",
          "Un cookie de langue (pv_locale) qui retient le français ou l'anglais.",
          "Votre choix de thème dans le stockage local.",
          "Sur votre téléphone, le portefeuille conserve votre clé de signature, votre coffre et les paiements non envoyés pour fonctionner sans réseau.",
        ],
        paras: ["Tous sont strictement nécessaires. Nous ne déposons aucun cookie marketing, d'où l'absence de bandeau de consentement."],
      },
      {
        title: "Durée de conservation",
        paras: [
          "Les enregistrements de paiement et de grand livre sont conservés aussi longtemps que l'exigent les règles comptables du partenaire. Les demandes de pilote sont supprimées après 24 mois sans contact.",
        ],
      },
      {
        title: "Vos droits",
        paras: [
          "Vous pouvez demander l'accès, la rectification ou la suppression de vos données, sous réserve des obligations de conservation ci-dessus. Pour un portefeuille, contactez le partenaire qui le fournit ; sinon, utilisez la page contact.",
        ],
      },
    ],
  },
  terms: {
    title: "Conditions d'utilisation",
    description: "Les conditions applicables au site PayVault, au bac à sable et au portefeuille de référence.",
    updated: "29 septembre 2026",
    sections: [
      {
        title: "À propos de ces conditions",
        paras: [
          "Ces conditions couvrent ce site, le bac à sable PayVault et le portefeuille de référence. L'usage commercial par un partenaire relève d'un contrat distinct signé avec ce partenaire.",
        ],
      },
      {
        title: "Le bac à sable",
        paras: [
          "Le bac à sable utilise uniquement de l'argent de test. Les soldes n'ont aucune valeur et peuvent être réinitialisés à tout moment. N'y saisissez ni vrai numéro d'identité ni données financières réelles.",
        ],
      },
      {
        title: "Paiements hors ligne",
        paras: [
          "Les paiements hors ligne sont signés sur votre téléphone et réglés dès qu'un appareil se reconnecte. Les dépenses hors ligne sont limitées par votre coffre et sa date d'expiration. La double dépense est bornée par ces limites, détectée au règlement et recouvrée auprès du titulaire.",
        ],
      },
      {
        title: "Découvert",
        paras: [
          "Lorsqu'il est proposé, le découvert est accordé par le partenaire qui fournit votre portefeuille, pas par PayVault. Il devient un prêt court avec des frais et une échéance une fois le paiement réglé, comme indiqué avant votre validation.",
        ],
      },
      {
        title: "Vos responsabilités",
        bullets: [
          "Protégez votre téléphone et votre code PIN.",
          "N'essayez pas de copier les clés de signature, de rejouer des paiements ou de dépenser au-delà de votre coffre.",
          "N'utilisez pas le service à des fins illégales.",
        ],
      },
      {
        title: "Disponibilité et responsabilité",
        paras: [
          "PayVault est un logiciel en phase de démarrage fourni en l'état. Nous veillons à sa disponibilité et à son exactitude sans garantir un service ininterrompu. Dans la mesure permise par la loi, PayVault n'est pas responsable des pertes indirectes.",
        ],
      },
      {
        title: "Modifications",
        paras: ["Nous pouvons mettre ces conditions à jour. La date en haut indique la dernière version."],
      },
    ],
  },
};

export default fr;

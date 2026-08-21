import "dotenv/config";
import mongoose from "mongoose";
import Museum from "./Models/museum.js";
import User from "./Models/users.js";
import Item from "./Models/items.js";
import Visit from "./Models/visits.js";

const accountEmail = "account@email.com";
const visitTitles = [
    "Capolavori del Rinascimento",
    "Osservare l'arte: percorso per scuole"
];

const works = [
    {
        objectId: "demo-venere-botticelli",
        title: "La nascita di Venere",
        author: "Sandro Botticelli",
        room: "Sala del Rinascimento",
        recognitionImage: "https://commons.wikimedia.org/wiki/Special:FilePath/The_Birth_of_Venus_by_Sandro_Botticelli_-_Google_Art_Project_-_edited.jpg",
        externalId: "Q107"
    },
    {
        objectId: "demo-gioconda-leonardo",
        title: "La Gioconda",
        author: "Leonardo da Vinci",
        room: "Sala del Rinascimento",
        recognitionImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg",
        externalId: "Q12418"
    },
    {
        objectId: "demo-david-michelangelo",
        title: "David",
        author: "Michelangelo Buonarroti",
        room: "Galleria delle sculture",
        recognitionImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Michelangelo%27s_David_-_右侧面.jpg",
        externalId: "Q179276"
    },
    {
        objectId: "demo-notte-stellata",
        title: "La notte stellata",
        author: "Vincent van Gogh",
        room: "Arte moderna",
        recognitionImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Van_Gogh_-_Starry_Night_-_Google_Art_Project_-_edited.jpg",
        externalId: "Q45585"
    },
    {
        objectId: "demo-urlo-munch",
        title: "L'urlo",
        author: "Edvard Munch",
        room: "Arte moderna",
        recognitionImage: "https://commons.wikimedia.org/wiki/Special:FilePath/The_Scream.jpg",
        externalId: "Q1075988"
    },
    {
        objectId: "demo-forme-colore",
        title: "Composizione VIII",
        author: "Vasilij Kandinskij",
        room: "Arte moderna",
        recognitionImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Vassily_Kandinsky,_1923_-_Composition_8,_Guggenheim.jpg",
        externalId: "Q193371"
    }
];

const levels = [
    {
        languageLevel: "infantile",
        duration: 15,
        suffix: "In breve",
        text: work => `${work.title} è un'opera di ${work.author}. Guarda i colori, le forme e prova a raccontare quale emozione ti fa sentire.`
    },
    {
        languageLevel: "medio",
        duration: 40,
        suffix: "Scopri",
        text: work => `${work.title}, realizzata da ${work.author}, invita a osservare come luce, gesto e composizione guidano lo sguardo. Ogni dettaglio contribuisce al significato dell'opera.`
    },
    {
        languageLevel: "specialistico",
        duration: 60,
        suffix: "Approfondisci",
        text: work => `In ${work.title}, ${work.author} costruisce una relazione tra soggetto e composizione attraverso ritmo visivo, trattamento della luce e scelte cromatiche. L'opera si legge nel contesto della ricerca artistica del suo autore.`
    }
];

function makeItems(museumId) {
    return works.flatMap(work => levels.map(level => ({
        museumId: museumId.toString(),
        objectId: work.objectId,
        title: `${work.title} - ${level.suffix}`,
        text: level.text(work),
        duration: level.duration,
        languageLevel: level.languageLevel,
        author: work.author,
        license: "CC BY-SA 4.0 / contenuto demo",
        price: 0,
        recognitionImage: work.recognitionImage,
        optional: level.languageLevel === "specialistico",
        room: work.room,
        tags: ["demo", "arte", level.languageLevel],
        externalId: work.externalId
    })));
}

try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI non definita");
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne({ email: accountEmail }).populate("museumId");
    if (!user?.museumId) {
        throw new Error(`Account demo non trovato: esegui prima npm run seed:test-accounts`);
    }

    const museum = user.museumId;
    museum.rooms = [
        { name: "Sala del Rinascimento", description: "Pittura e scultura italiana tra Quattrocento e Cinquecento." },
        { name: "Galleria delle sculture", description: "Corpi, materia e movimento nella tradizione scultorea." },
        { name: "Arte moderna", description: "Nuovi linguaggi, colori e forme tra XIX e XX secolo." }
    ];
    museum.description = "Un percorso demo tra capolavori italiani e protagonisti dell'arte moderna.";
    await museum.save();

    await Item.deleteMany({ museumId: museum._id.toString(), objectId: /^demo-/ });
    await Visit.deleteMany({ museumId: museum._id, title: { $in: visitTitles } });

    const items = await Item.insertMany(makeItems(museum._id));
    const byObjectAndLevel = new Map(items.map(item => [`${item.objectId}:${item.languageLevel}`, item._id]));
    const sequenceFor = (level, selectedWorks = works) => selectedWorks.map((work, index) => ({
        itemId: byObjectAndLevel.get(`${work.objectId}:${level}`),
        order: index,
        privateContents: index === 0 ? [{
            title: "Nota per la docente",
            type: "text",
            text: "Chiedi al gruppo di descrivere l'opera senza usare il nome dei colori.",
            url: ""
        }] : []
    }));

    const visits = await Visit.insertMany([
        {
            museumId: museum._id,
            title: visitTitles[0],
            synchronized: true,
            syncCode: "RINASCIMENTO",
            sequence: sequenceFor("medio"),
            quiz: [
                { question: "Quale elemento guida lo sguardo in un'opera?", answers: ["La composizione", "Il prezzo", "Il numero di sala"], correctIndex: 0 },
                { question: "Botticelli è associato soprattutto a quale periodo?", answers: ["Rinascimento", "Barocco", "Futurismo"], correctIndex: 0 }
            ]
        },
        {
            museumId: museum._id,
            title: visitTitles[1],
            synchronized: false,
            sequence: sequenceFor("infantile", works.slice(0, 4)),
            quiz: [
                { question: "Quale opera mostra un cielo pieno di vortici?", answers: ["La notte stellata", "La Gioconda", "David"], correctIndex: 0 },
                { question: "Che cosa possiamo osservare davanti a un'opera?", answers: ["Colori e forme", "Solo il titolo", "Il biglietto"], correctIndex: 0 }
            ]
        }
    ]);

    museum.visits = visits.map(visit => visit._id);
    await museum.save();
    console.log(`Seed completato per ${museum.name}: ${items.length} item e ${visits.length} visite.`);
} catch (error) {
    console.error(`Seed contenuti fallito: ${error.message}`);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
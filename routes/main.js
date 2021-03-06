const express = require("express"),
    router = express.Router(),
    bodyParser = require("body-parser"),
    bcrypt = require("bcrypt");
    const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
    const mapBoxToken = "pk.eyJ1IjoibmVncnVnZW9yZ2U4IiwiYSI6ImNraDdvM2J2YTBtanoyeG81Y3d0aWg0NzYifQ.b_3-hL80A0ifUoBOEJ00xg"
const geocoder = mbxGeocoding({accessToken:mapBoxToken});


const passport = require("passport"),
LocalStrategy = require("passport-local").Strategy;

// require database
const db = require("../db");


    router.use(bodyParser.urlencoded({extended:true}));
  

    router.use(bodyParser.json());
    
    // router.use(passport.initialize());
    // router.use(passport.session());
    

//     passport.serializeUser(function(user,done){
//         console.log("serialize");
//         done(null,user.username);
//     });
//     passport.deserializeUser(function(user,done){
//         console.log("deserialize");
//             //console.log(user);
    
//     db.query(`select * from users where mail="${user}"`,(err,rows,fields)=>{
       
//         done(err,rows[0]);
//     })
// });



// passport.use(new LocalStrategy({
//     usernameField: "username",
//     passwordField: "password",
//     passReqToCallback: true
// },
// function(req,username,password,done){
//     console.log(username);
//     //console.log(password);
//     // wuut protect from sql injections
//     db.query(`SELECT * from users where mail=?`,[username],async (err,rows)=>{
//         if(err)
//         return done(err);
//         console.log(rows);
//         if(rows.length===0){
//             console.log("mail invalid");
//             return done(null,false,null)
//         }
//         if(!(await bcrypt.compare(password,rows[0].password))){
//             console.log("parola invalida");
//             return done(null,false,null);
//         }
//         // daca totul merge
//         return done(null,rows[0]);
//     })
// }

// ))


// functie cu care verific daca pot accesa
// pagina de edit a adminului
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/map");
}







    router.get("/",(req,res)=>{
    // console.log("facem qu");
    // q = "INSERT into users values(null,'Maries','Stefi','stefania_maries@yahoo.com',0753841957)";
    // db.query(q, (err, rows, fields)=>{
    //     console.log("suntem in query")
    //    if(err){
    //     throw err; 
    //    }
        
    //    console.log("Am reusit!!");
    // })
    // q = "SELECT * FROM tickets t Inner Join users u ON t.iduser=u.iduser";
    // db.query(q,(err,rows,fields)=>{
    //     if(err)
    //     {
    //         throw(err);
    //     }
    //     console.log(rows[0])
    //     console.log(">>><<<<<<<<<<<<<<<<")
    //     console.log(">>>>>>>>>>>")

    // res.render("main.ejs",{bilete:rows,id:req.session.userId});
    // });
    res.redirect("/map");
    });

    router.get("/addbilet",(req,res)=>{
        res.render("addbilet.ejs")
    })


    router.get("/signup",(req,res)=>{
        res.render("signup.ejs");
    })


    router.post("/signup",async (req,res)=>{
        console.log(req.body);
        console.log(req.body.nume);
        console.log(req.body.prenume);
        console.log(req.body.telefon);
        console.log(req.body.mail);
        let hashedPassword = await bcrypt.hash(req.body.password,10);

        let q = `SELECT * From users where mail =? `
        db.query(q,[req.body.mail],(err,rows,fields)=>{
            if(err)
                throw err;
            if(rows.length !==0 ){
                console.log("id existent");
                res.redirect("/signup");
                
            }  
            else{
                q = `INSERT into users(nume,prenume,mail,password,telefon) values(?,?,?,?,?)`
                db.query(q,[req.body.nume,req.body.prenume,req.body.mail,hashedPassword,req.body.telefon],(err,rows,fields)=>{
                    if(err)
                    {
                        throw err;
                    }
                    console.log("am reusit")
                    console.log(rows);
                    
                    q = "SELECT * FROM users where mail=?"
                    db.query(q,[req.body.mail],(err,rows,fields)=>{
                        if(err)
                            throw err;
                        console.log(rows[0].id_user);
                        req.session.userId = rows[0].id_user;
                        res.redirect("/map");
                    })


                  
                })
            }
        })


// prevent sql injections
       
    })

    router.get("/ss1",(req,res)=>{
        console.log(req.session.userId)
        res.send("in ss");
    })


    router.get("/signin",(req,res)=>{
        res.render("signin.ejs");
       
    })


    router.post("/signin", (req,res)=>{
        console.log(req.body.mail);
        db.query("SELECT * from users where mail=?",[req.body.mail],async (err,rows,fields)=>{
            if(err)
                {
                    console.log(err);
                    throw err;
                }
            if(rows.length ===0){
                console.log("mail invalid")
                res.redirect("/signin");
            }
              
            else if(!(await(bcrypt.compare(req.body.password,rows[0].password)))){
                console.log("parola invalida")
                res.redirect("/signin");
            }
            else{
                console.log("te ai logat")
                req.session.userId  = rows[0].id_user;
                console.log(req.session.userId);

                res.redirect("/map");
            }
        })
    })


    router.get("/signout",(req,res)=>{
        
        req.session=null;
        res.redirect("/map")
    })

    router.get("/secret",(req,res)=>{
        if(req.session.userId)
            res.send("this is the secret");
        else
            res.redirect("/");
        })








        router.get("/geocode", async (req,res)=>{
        const geodata  = await  geocoder.forwardGeocode({
            query: 'Piata Unirii,Cluj, Romania',
            limit:1
        }).send()
        console.log(geodata.body.features);
        console.log(geodata.body.features[0].geometry.coordinates)
        console.log(geodata.body.features[0].geometry.coordinates[0])
        console.log(geodata.body.features[0].geometry.coordinates[1])
        res.send("ok");
        })





        // router.get("/map",(req,res)=>{
        //     res.render("map.ejs",{obiective:obiective});
        // })

module.exports = router;



/*
obiective= [
    {
        Oras: 'Bucuresti',
        Titlu_obiectiv: 'Gradina Botanica',
        Categorie: 1,
        descriere: 'este un loc special, unde vei lua o pauz?? de la agita??ia din Bucuresti. Ascunse ??n inima Gr??dinii, ??i mai departe de orice zgomot, ve??i g??si serele. Intra??i cu ??ncredere! Preferatele noastre sunt cele cu cactu??i. Iar accesul ??n sere cost?? doar 2 lei.',
        price: '$',
        type:"Point",
        latitude:"",
        longitude:"",
        link: 'https://gradina-botanica.unibuc.ro/contact/',
        img:'/images/locatii/GradinaBotanica_Bucuresti.jpg'
    },

    {
        Oras: 'Bucuresti',
        Titlu_obiectiv: 'Muzeul Cotroceni',
        Categorie: 2,
        descriere: 'Vis-a-vis de Gr??dina Botanic?? este intrarea la Muzeul Cotroceni. Vizita trebuie programat??, pentru c?? se face doar cu ghidul muzeului. Dar va fi cu at??t mai deosebit??.',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:'http://www.muzeulcotroceni.ro/ ',
        img:'/images/locatii/GradinaBotanica_Bucuresti.jpg'
    },

    {
        Oras: 'Bucuresti',
        Titlu_obiectiv: 'Casa memorial?? Ion Minulescu',
        Categorie: 3,
        descriere: 'Foarte aproape de Muzeul Cotroceni, se afl?? apartamentul familiei poetului Ion Minulescu. E un apartament care te invit?? la relaxare ??i visare. ',
        price: '$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:'https://mnlr.ro/case-memoriale/casa-memoriala-ion-minulescu-claudia-millian/ ',
        img:'/images/locatii/CasaMemoriala-IonMinulescu.jpg'
    },

    {
        Oras: 'Oradea',
        Titlu_obiectiv: 'Pia??a Unirii',
        Categorie: 3,
        descriere: 'Aici este ??i centrul istoric al ora??ului, centru care arat?? exact a??a cum am tot v??zut ??n marile ora??e europene, precum Budapesta sau Barcelona.',
        price: '$',
        type:"Point",
        latitude:"",
        longitude:"",
        link: 'https://www.oradeaheritage.ro/patrimoniu-oradea/ ',
        img:'/images/locatii/PiataUnirii_Oradea.jpg'
    },

    {
        Oras: 'Oradea',
        Titlu_obiectiv: 'Turnul Prim??riei din Oradea',
        Categorie: 3,
        descriere: 'Ce modalitate mai u??oar?? pentru a putea cuprinde cu privirea ??ntreg ora??ul dec??t un turn? U??oar?? este un fel de-a spune c??ci sc??rile ce duc spre Turnul Prim??riei din Oradea sunt o provocare destul de mare. ????i trebuie ceva condi??ie fizic?? pentru a face fa???? misiunii, dar ??i c??nd vei ajunge sus, s?? vezi atunci r??splat??!',
        price: '$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:' http://www.oradea.ro/pagina/turnul-primariei',
        img:'/images/locatii/TurnulPrimariei_Oradea.jpg'
    },

    {
        Oras: 'Oradea',
        Titlu_obiectiv: 'Sinagoga Zion',
        Categorie: 3,
        descriere: 'Construit?? ??n 1878 cu influen??e ale stilului maur, avem de-a face cu cea mai mare sinagog?? neolog?? din Rom??nia, reabilitat?? ??i ea tot cu bani europeni.',
        price: '$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:' https://www.oradeaheritage.ro/sinagoga-neologa-sion/',
        img:'/images/locatii/Sinagoga-Sion_Oradea.jpg'
    },

    {
        Oras: 'Cluj',
        Titlu_obiectiv: 'Piata Unirii',
        Categorie: 3,
        descriere: 'Principala piata, Piata Unirii, este un amestec atractiv de stiluri. In ciuda unor eforturi stangace in vremea comunismului si de dupa comunism de a o atenua, arhitectura pastreaza aspectul original, cu unele elemente sasesti.',
        price: '$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:'https://cluj.com/locatii/piata-unirii-cluj/ ',
        img:'/images/locatii/piata-unirii-cluj.jpg'
    },

    {
        Oras: 'Cluj',
        Titlu_obiectiv: 'Muzeul National de Istorie a Transilvaniei',
        Categorie: 1,
        descriere: 'Romanii au un talent aparte pentru arhitectura funerara si unul dintre cele mai vrednice locuri de admiratie este Cimitirul Hajongard.',
        price: '$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:'https://ro.wikipedia.org/wiki/Muzeul_Na%C8%9Bional_de_Istorie_a_Transilvaniei',
        img:'/images/locatii/MuzeulTransilvaniei_Cluj.jpg'
    },

    {
        Oras: 'Brasov',
        Titlu_obiectiv: 'Biserica Neagr??',
        Categorie: 2,
        descriere: 'Biserica Neagr?? poart?? aceast?? denumire deoarece ??n anul 1689 ??n urma unui incendiu care a cuprins tot ora??ul, o mare parte din biseric?? a luat foc. La ??nceput l??ca??ul a purtat denumirea de hramul Sfintei Maria, dar ulterior a fost acceptat?? aceast?? nou?? denumire.',
        price: '$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:'https://brasovtourism.app/places/biserica-neagra-nejbc17zye9ziq ',
        img:'/images/locatii/BisericaNeagra_Brasov.jpg'
    },

    {
        Oras: 'Brasov',
        Titlu_obiectiv: 'Satul Viscri',
        Categorie: 4,
        descriere: 'Satul lui Charles, cum este cunoscut acum Viscri, este vizitat anual de peste 15.000 de turi??ti, majoritatea str??ini. Viscri a fost trecut pe harta mondial?? a satelor tradi??ionale din lume, afl??ndu-se ??n patrimoniul UNESCO.',
        price: '$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:' https://www.historia.ro/sectiune/travel/articol/satul-viscri-o-comoara-transilvana',
        img:'/images/locatii/Viscri_Brasov.jpg'
    },

 {Oras:"Arieseni",
    Titlu_obiectiv:"Partie Arieseni",
    Categorie:3,
    descriere:"Statiunea Vartop-Arieseni din Judetul Alba are 2 partii de ski si snowboard. Durata medie a sezonului de ski si snowboard in aceasta regiune se intinde din luna decembrie pana in martie-aprilie.",
    price:"$$$",
    type:"Point",
    latitude:"",
    longitude:"",
    link: ' https://www.arieseni.pro/partie-arieseni',
    img:'/images/locatii/Arieseni1.jpg'
},

    {
        Oras:"Iasi",
        Titlu_obiectiv:"Palatul Cultural",
        Categorie:2,
        descriere:"Palatul Culturii din Ia??i este o cl??dire emblematic??, construit??, ??n perioada 1906 - 1925, ??n perimetrul fostei cur??i domne??ti medievale moldovene??ti, pe locul fostului palat domnesc. Cl??direa este ??nscris?? ??n Lista monumentelor istorice, av??nd cod LMI IS-II-m-A-03957.01, ??i din ansamblu mai fac parte ??i ruinele cur??ii domne??ti. Edificiul a servit ini??ial drept Palat Administrativ ??i de Justi??ie. ??n anul 1955, destina??ia cl??dirii a fost schimbat?? ??ntr-una cultural??, devenind gazda unor institu??ii culturale din Ia??i. Ast??zi, Palatul Culturii este sediul Complexului Muzeal Na??ional ???Moldova???, ce cuprinde Muzeul de Istorie a Moldovei, Muzeul Etnografic al Moldovei, Muzeul de Art??, Muzeul ??tiin??ei ??i Tehnicii ?????tefan Procopiu???, precum ??i Centrul de Conservare-Restaurare a Patrimoniului Cultural. P??n?? la ??nceperea lucr??rilor de renovare, ??n aripa de nord-est a palatului se afla sediul Bibliotecii Jude??ene ???Gheorghe Asachi???.",
        price:"$", 
        type:"Point",
        latitude:"",
        longitude:"",
        link: 'https://palatulculturii.ro/',
        img:"/images/locatii/palatul-culturii-iasi.jpg"
    },

    {
        Oras:"Iasi",
        Titlu_obiectiv:"Gradina Botanica Anastasie Fatu",
        Categorie:4,
        descriere:"Gr??dina Botanic?? ???Anastasie F??tu??? din Ia??i este cea mai veche gr??din?? botanic?? din Rom??nia.",
        price:"$$",
        type:"Point",
        latitude:"",
        longitude:"",
        link: 'https://www.uaic.ro/gradina-botanica-anastasie-fatu/',
        img:"/images/locatii/GradinaBotanica_Iasi.jpg"
    },
    {
        Oras:"Sinaia",
        Titlu_obiectiv:"Castelul Peles",
        Categorie:4,
        descriere:"Castelul Pele?? este un palat din Sinaia, construit ??ntre anii 1873 ??i 1914. Construit?? ca re??edin???? de var?? a regilor Rom??niei, cl??direa se afl??, ??n prezent, ??n proprietatea Familiei Regale a Rom??niei ??i ad??poste??te Muzeul Na??ional Pele??.",
        price:"$$",
        type:"Point",
        latitude:"",
        longitude:"",
        link: 'http://peles.ro/ ',
        img:"/images/locatii/CastelulPeles_Sinaia.jpg"

    },
    {
        Oras:"Ploiesti",
        Titlu_obiectiv:"Muzeul Ceasului Nicolae Smiache",
        Categorie:3,
        descriere:"Muzeul Ceasului ???Nicolae Simache??? este un muzeu jude??ean din Ploie??ti, Rom??nia. Organizat din ini??iativa profesorului N. I. Simache, ca sec??ie a Muzeului de Istorie, el dateaz?? din 1963. A fost instalat mai ??nt??i ??ntr-o sal?? din Palatul Culturii, p??n?? c??nd, prin achizi??ii, a c??p??tat un patrimoniu at??t de bogat ??nc??t a avut nevoie de un local propriu. I s-a pus atunci la dispozi??ie Casa Luca Elefterescu[2], care a fost adaptat?? noului scop; lucr??rile de amenajare s-au terminat ??n anul 1971 ??i muzeul s-a deschis ??n ianuarie 1972.",
        price:"$$", 
        type:"Point",
        latitude:"",
        longitude:"",
        link: 'http://www.cimec.ro/muzee/ceasuri/ceas.htm',
        img:"/images/locatii/MuzeulCeasului_Ploiesti.jpg"
},
 {
        Oras:"Satu-Mare",
        Titlu_obiectiv:"Castelul Karoly din Carei",
        Categorie:3,
        descriere:"Castelul este amplasat ??n mijlocul unui frumos parc dendrologic, ??n care localnicii se plimb?? cu pl??cere. Proaspe??ii c??s??tori??i din zon?? ??l aleg adesea ??i pentru realizarea pozelor de nunt??.Pe l??ng?? castel, ??n Carei po??i vizita Monumentul Eroului Necunoscut ??i un complex cu ap?? termal?? ce se laud?? cu cel mai mare tobogan din ??ara noastr??.",
        price:"$$",
        type:"Point",
        latitude:"",
        longitude:"",
        link: 'https://www.historia.ro/sectiune/travel/articol/castelul-karoly-din-carei ',
        img:"/images/locatii/castelul-karoly-din-carei.jpg"
    },
    {   Oras: 'Arges',
        Titlu_obiectiv: 'Transfagarasan',
        Categorie: 4,
        descriere: 'Sau DN7C este una dintre cele mai spectaculoase sosele din Romania, incercata, cu pedala pe acceleratie, la maxim si de cei de la Top Gear. Drumul serpuieste printre Muntii Fagaras ca sa lege doua regiuni istorice, Muntenia si Transilvania. Aveti drum intins, 90 de kilometri construiti cu truda de catre armata romana, in perioada 1970-1974. Cel mai inalt punct al soselei montane este la Balea Lac, 2.034 de metri. Este depasita, in prezent, de Transalpina, cea mai inalta sosea, in Pasul Urdele cu 2.145 de metri.',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:'https://www.transfagarasan.net/',
        img:"/images/locatii/transfagarasan.jpg"
    },        
    {  Oras: 'Arges',
        Titlu_obiectiv: 'Baraju Vidraru',
        Categorie: 4,
        descriere: '',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:'https://muntii-fagaras.ro/vidraru ',
        img:"/images/locatii/baraj-vidraru.jpg"
    },
    { Oras: 'Timisoara',
        Titlu_obiectiv: 'Pia??a Victoriei',
        Categorie: 2,
       descriere: 'Unul dintre cele mai vizitate ??i instagramabile obiective turistice din Timi??oara e reprezentat de Pia??a Victoriei. Aceasta este cunoscut?? ??i sub denumirea de Pia??a Operei ??i reprezint?? pia??a central?? a ora??ului Timi??oara. Mai mult de at??t, ??n acest loc, dar pe 20 decembrie 1989, Timi??oara a fost declarat primul ora?? liber de comunism din Romania. Dac?? te ui??i cu aten??ie pe cl??direa Operei, ??nc?? po??i oberva urmele gloan??elor trase ??n timpul evenimentelor din perioada respectiv??.',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:'http://www.timisoara-info.ro/ro/component/content/article/91-piata-victoriei.html ',
        img:"/images/locatii/PiataVictoriei.jpg"
    },
    {  Oras: 'Mehedinti', 
        Titlu_obiectiv: 'Parcul National Portile de Fier',
        Categorie: 2,
       descriere: 'Doua judete ale Romaniei, Mehedinti si Caras Severin isi ???revendica dreptul??? asupra Parcului Natural Portile de Fier. Acesta este unul dintre cele mai mari parcuri naturale din tara si reuneste sub cupola sa 18 rezervatii. Muntii Banatului-Almajului si Locvei se intalnesc cu muntii Mehedinti si ajung intr-o parte a Podisului Mehedinti. ',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:'https://www.pnportiledefier.ro/ ',
        img:"/images/locatii/ParculNationalPortiledeFier.jpg"
    },
    {   Oras: 'Dolj',
        Titlu_obiectiv: 'Rezerva??ia ornitologic?? de la Ciupercenii Noi',
        Categorie: 2,
       descriere: '??n jude??ul Dolj, ??n zona inundabil?? din Lunca Dun??rii, se afl?? o zon?? de 500 hectare protejat?? de lege. Asta pentru c?? acolo se g??sesc specii de p??s??ri protejate de lege, datorit?? faptului c?? acestea sunt ??n pericol de extinc??ie. Printre p??s??rile care pot fi admirate aici se num??r?? egreta mic??, barza neagr?? ??i barza alb??, pelicanul cre??, st??rcul ro??u sau li??i??a, ??ns?? aici se g??sesc peste 140 specii de p??s??ri. Rezerva??ia a fost inclus?? pe lista monumentelor naturale protejate de lege ??nc?? din 1971.',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:'https://discoverdolj.ro/places/rezervatia-ornitologica-ciuperceni-desa-jxsmrqfi8ac3ra ',
        img:"/images/locatii/Rezervatia-ornitologica-de-la-Ciupercenii-Noi.jpg"
    },

    { Oras: 'Targoviste', 
        Titlu_obiectiv: ' Turnul Chindiei',
        Categorie: 3,
       descriere: 'Este situat in complexul muzeal ???Curtea Domneasca??? si este construit in perioada in care a fost Vlad Tepes domnitor. Este un turn care se impune prin maretie si are o istorie foarte bogata. Initial a fost turn-clopotnita, dupa care s-a transformat in turn de aparare, turn ceasornic si foisor de foc. Daca vrei sa descoperi o panorama deosebita asupra orasului, trebuie sa urci cele 122 de trepte ale turnului si sa te bucuri de terasa aflata la inaltimea de 27 de metri.',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:'http://curteadomneascadintargoviste.ro/prezentare-complex/turnul-chindiei/ ',
        img:"/images/locatii/TurnulChindiei.jpg"
    },

    {Oras: 'Giurgiu',
        Titlu_obiectiv: 'Parcul Natural Comana',
        Categorie: 2,
       descriere: 'Rezerva??ia Natural?? Comana se ??ntinde pe raza mai multor comune din sudul jude??ul Giurgiu (comunele Comana, C??lug??reni, Coliba??i, B??neasa, Gostinari, Greaca, Mihai Bravu ??i Singureni), av??nd o suprafa???? de aproape 25 hectare. Parcul a devenit arie protejat?? din 2005, cu scopul de a proteja speciile de plante endemice ??i fauna specific?? zonei. Printre animalele prezente ??n rezerva??ie enum??r pop??nd??ul, broasca ??estoas?? de balt??, tritonul danubian, dar ??i multe p??s??ri care ????i g??sesc refugiu aici pe timp de iarn??, printre care sticletele, barza alb?? ??i neagr??, li??i??a, ??ig??nu??ul ??i altele.',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:'http://www.comanaparc.ro/ ',
        img:"/images/locatii/ParculNaturalComana.jpg"
    },
    { Oras: 'Arad',
        Titlu_obiectiv: 'Statiunea Moneasa',
        Categorie: 1,
       descriere:'Daca va petreceti vacanta in judetul Arad, profitati de zilele libere si cautati cazare pentru cateva zile si in statiunea Moneasa. Documentele istorice arata ca aceasta asezare exista inca din anul 1597, iar proprietatile izvoarelor termale erau cunoscute de catre localnici. Profitati din plin de apele terapeutice, va veti intoarce mult mai relaxati. ',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:'https://statiuneamoneasa.ro/ ',
        img:"/images/locatii/StatiuneaMoneasa.jpg"
    },
    {    Oras: 'Bacau',
        Titlu_obiectiv: 'Salina Drumul S??rii ',
        Categorie: 1,
       descriere: ' Dac?? ajungi ??n T??rgu Ocna din jude??ul Bac??u, trebuie s?? faci o vizit?? minei de sare de acolo. Po??i chiar s?? popose??ti o zi la salin??. Ai ??ansa s?? faci sport, s?? vizitezi expozi??ii de art?? sau biserica din salin??. Dac?? vrei s?? faci baie ??n ap?? s??rat??, baza turistic?? include ??i un ??trand cu ap?? s??rat?? ??n care te po??i relaxa. Petrec??nd c??teva ore ??n subteran, respir??nd aerul s??rat po??i trata eventualele afec??iuni respiratorii. Salina este concentrat?? la orizontul IX al minei Trotu??.',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:'https://locuridinromania.ro/judetul-bacau/orasul-targu-ocna/salina-drumul-sarii.html ',
        img:"/images/locatii/SalinaDrumulSarii.jpg"
    },
    {  Oras: ' Bistrita-Nasaud',
        Titlu_obiectiv: 'Parcul Na??ional Mun??ii Rodnei ',
        Categorie: 1,
       descriere: 'Parcul Na??ional Mun??ii Rodnei a fost desemnat rezerva??ie natural?? ??n anul 1990 ??i este unul dintre cele mai valoroase astfel de rezerva??ii datorit?? structurilor geologice, dar ??i al interesului spre faun??, flor?? ??i speologie ??n zon??. Exist?? aici inclusiv c??teva specii endemice de plante. ??n interiorul parcului pute??i vizita diverse m??n??stiri (Biserica de lemn din M??n??stirea Moisei, construit?? ??n 1672) ??i arii protejate (pe??teri, monumente naturale), dar ??i mori ????r??ne??ti de ap??, ??n satul S??cel. ??n Rezerva??ia natural?? Mun??ii Rodnei sunt protejate ??i diverse specii de animale ??i p??s??ri. ',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:' https://www.parcrodna.ro/ ',
        img:"/images/locatii/ParculNationalMuntiiRodnei.jpg"
    },
    { Oras: 'Botosani ',
        Titlu_obiectiv: 'Casa memorial?? Mihai Eminescu ??i lacul de la Ipotesti ',
        Categorie: 1,
       descriere: 'Locul unde a copil??rit cel mai mare poet al Rom??niei ad??poste??te ast??zi un muzeu dedicat vie??ii ??i operelor lui Eminescu, al??turi de mormintele p??rin??ilor ??i fra??ilor acestuia. Tot acolo este ??i lacul cu nuferi care a inspirat at??tea poezii celebre.  ',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:'https://planiada.ro/destinatii/botosani/casa-memoriala-mihai-eminescu-si-lacul-din-ipotesti-281 ',
        img:"/images/locatii/CasaMihaiEminescu.jpg"
    },
    {  Oras: ' Braila',
        Titlu_obiectiv: 'Cetatea Br??ilei ',
        Categorie: 2,
       descriere: 'Ruinele vechii cet????i a Br??ilei, atestat?? documentar din 1368, ??i-a l??sat amprenta peste ora??. Cetatea a fost construit?? datorit?? accesului la Dun??re, ??n portul c??reia se importau m??rfuri diverse. Centrul istoric al municipiului Br??ila p??streaz?? ??i ??n prezent urmele acestei cet????i ??i tunelurile subterane folosite de turci. ',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:' http://obiectivbr.ro/content/cetatea-br%C4%83ilei-d%C4%83r%C3%A2mat%C4%83-cu-3000-de-salahori ',
        img:"/images/locatii/CetateaBrailei.jpg"
    },
    {   Oras: ' Buzau',
        Titlu_obiectiv: ' Lacul Vulturilor',
        Categorie: 1,
       descriere: 'Lacul Vulturilor sau Lacul fara Fund se gaseste pe partea estica a versantului Malaia, la altitudinea de 1420 m, in Muntii Siriului. I se spune Lacul Vulturilor deoarece aici, conform unei legende, consemnata de Alexandru Vlahuta in cartea sa Romania pitoreasca, lacul ar fi un loc unde vulturii veneau primavara sa-si invete puii sa zboare. Numele de Lacul fara Fund provine dintr-o alta legenda, despre un cioban care si-a lasat turma de mioare, a aruncat bata in apa lacului si a plecat. Dupa un an de peregrinari, ciobanul si-ar fi regasit bata in apele Dunarii si mistuit de dorul mioarelor si a locurilor natale, se intoarce acasa.',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:'https://ro.wikipedia.org/wiki/Lacul_Vulturilor  ',
        img:"/images/locatii/LaculVulturilor.jpg"
    },
    { Oras: 'Calarasi',
        Titlu_obiectiv: 'Ostroave pe Dunare ',
        Categorie: 1,
       descriere: ' Amplasarea municipiului C??l??ra??i pe fluviul Dun??re ??i pe bra??ul Borcea al fluviului ??i ofer?? un poten??ial turistic foarte mare. De altfel, aici exist?? c??teva plaje amenajate, precum Plaja Mare, amplasat?? vizavi de Parcul Central al ora??ului, Plaja Tineretului sau Plaja Automobili??tilor, pe care se poate ajunge doar cu ma??ina. Totodat?? exist?? ??i un traseu cu vaporul peste Dun??re, p??n?? ??n sta??iunea Silistra de pe malul Bulg??resc.',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:' https://ro.wikipedia.org/wiki/Ostroavele_Dun%C4%83rii_-_Bugeac_-_Iortmac ',
        img:"/images/locatii/OstroaveDunare.jpg"

    },
    { Oras: ' Constanta',
        Titlu_obiectiv: 'Monumentul Tropaeum Traiani ',
        Categorie: 1,
       descriere: 'O parte a istoriei dacilor si romanilor a ramas si in Adamclisi, si anume, monumentul Tropaeum Traiani. Ridicat intre 105-106, acest edificiu este simbolul victoriei Imparatului Traian asupra Daciei. Merita vazut, fie si doar o data in drumul spre litoral. ',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:' https://www.parcmamaia.ro/adamclisi-tropaeum-traiani/ ',
        img:"/images/locatii/TropaeumTraiani.jpg"
    },

    {Oras: 'Galati ',
        Titlu_obiectiv: 'Faleza Dun??rii',
        Categorie: 2,
       descriere: 'Principala atrac??ie a ora??ului este Faleza Dun??rii, o adev??rat?? coloan?? vertebral?? a turismului ??n Gala??i. Cu o lungime de 4 km, dispus?? ??n dou?? trepte - faleza superioar?? ??i faleza inferioar??, este considerat?? cea mai lung?? din Europa, de pe cursul Dun??rii. De-a lungul falezei ve??i ??nt??lni sculpturi metalice realizate ??n anii 70, care ????i aduc contribu??ia la ??mbog????irea experien??ei vizitatorilor sub aspect estetic. Faleza este parte integrant?? din via??a locuitorilor ora??ului, fiind terenul de sport ??n aer liber pentru iubitorii de mi??care, dar ??i loc de inspira??ie pentru fotografii amatori sau profesioni??ti. Faleza este accesibil?? ??n orice anotimp ??i ocazional se organizeaz?? aici diferite evenimente: concerte, expozi??ii, ??ntreceri sportive. ',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:' https://galaticityapp.ro/places/faleza-dunarii-5v3aavcoy-yozg ',
        img:"/images/locatii/FalezaDunarii.jpg"
    },
    {   Oras: 'Hunedoara ',
        Titlu_obiectiv: 'Castelul Corvinilor ',
        Categorie: 2,
       descriere: 'Povestea Castelului Corvinilor ??ncepe la 1409, c??nd nobilul Voicu, al??turi de fra??ii lui (Radu ??i Mogo??), primesc din partea regelui Ungariei Sigismund de Luxemburg, o mo??ie (numit?? ??n latine??te ???possession???), care cuprindea ??i cetatea regal??. Voicu nu adaug?? nimic cet????ii, dar fiul acestuia, Ioan de Hunedoara (Johannes de Hunyad) o va transforma ??ntr-un castel comparabil cu alte construc??ii ale vremii din centrul ??i vestul Europei.  ',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:' http://www.castelulcorvinilor.ro/',
        img:"/images/locatii/CastelulCorvinilor.jpg"
    },
    { Oras: 'Harghita ',
        Titlu_obiectiv: 'Lacul Ro??u ',
        Categorie: 2,
       descriere: ' Lacul Ro??u, cunoscut de localnici ??i sub numele de Lacul Ghilco??, este un lac de acumulare format ??n mod natural, la poalele muntelui H????ma??ul Mare. Acesta avea, la ultimele m??sur??tori, un perimetru de 2830 m. S-a format ??n urma pr??bu??irii unui v??rf de munte, ??n anul 1837 sau 1838 (de??i este un lac t??n??r, anul de formare al acestuia este neclar). Dup?? ce valea a fost blocat?? de alunecarea de teren, p??durea de brazi a fost inundat??, iar ??n timp, arborii s-au pietrificat. Lacul Ro??u este cel mai mare lac montan natural din Rom??nia ??i este un loc preferat de turi??ti pentru recreere. De aici, vizitatorii se pot aventura pe diverse trasee turistice sau se pot plimba cu barca pe lac.',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:'  https://www.infoghidromania.com/lacul_rosu.html',
        img:"/images/locatii/LaculRosu.jpg"
    },
    { Oras: 'Maramures ',
        Titlu_obiectiv: ' Cimitirul Vesel de la S??p??n??a' ,
        Categorie: 3,
       descriere: 'Se presupune ca atitudinea vesela in fata mortii era un obicei al Dacilor. Acestia credeau in viata vesnica, moartea fiind pentru ei doar o trecere intr-o alta lume. Nu vedeau moartea ca un sfarsit tragic ci ca pe o sansa de a se intalni cu zeul Zamolxe. In multe zone ale Romaniei, dupa datina traditionala, despartirea de cel mort se face prin voie buna. Priveghiul este considerat ca fiind ultima petrecere la care participa atat mortul ca si cei pe care ii lasa in urma. Privind lucrurile din aceasta perspectiva, Ioan Stan Patras a incercat sa transpuna in lucrarile sale, esenta vietii decedatului, intr-un mod mai vesel, care sa-l faca pe om sa priveasca moartea cu mai multa usurinta. ',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:' https://www.travelguideromania.com/ro/cimitirul-vesel-din-satul-sapanta-maramures/ ',
        img:"/images/locatii/CimitirulSapanta.jpg"
    },
    { Oras: 'Mures ',
        Titlu_obiectiv: ' Castelul Teleki ',
        Categorie: 3,
       descriere: ' Superbul ansamblu arhitectonic construit pentru familia Teleki se gaseste in localitatea Gornesti, la 17 kilometri de Targu Mures, chiar in mijlocul unui parc dendrologic.Se spune despre el ca este cel mai frumos castel din intregul Ardeal, avand, de asemenea, porecla de ???Comoara Muresului???. Cladirea prezinta caracteristici arhitecturale in stilul Grassalkovich, proiectul acesteia fiind facut de arhitectul austriac Andreas Mayerhoffer. ',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:' http://castelintransilvania.ro/castelul-teleki-gornesti-.html ',
        img:"/images/locatii/CastelulTeleki.jpg"
    },
    { Oras: 'Neamt',
        Titlu_obiectiv: 'Barajul ??i lacul Bicaz',
        Categorie: 3,
       descriere: 'Dac?? ajunge??i ??n jude??ul Neam?? trebuie neap??rat s?? trece??i ??i pe la Barajul Bicaz. Acesta este considerat a fi cel mai mare baraj artificial din ??ara noastr?? construit pe un r??u interior (R??ul Bistri??a), iar ridicarea lui a durat 10 ani (1950???1960). ??n urma construirii Barajului Bicaz a ap??rut ??i lacul artificial Bicaz, cunoscut ??i ca Lacul Izvorul Muntelui. Aici se vars?? mai multe r??uri din apropiere, iar apa acumulat?? este folosit?? pentru a produce energie ??n centrala hidroelectric?? ???Bicaz-Stejaru???. ??n apropierea lacului se afl?? ??i ???Piatra Teiului???, un monument al naturii format dintr-o singur?? st??nc??. Barajul ??i lacul Bicaz se afl?? la patru kilometri amonte de ora??ul Bicaz. ',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:' https://bicazkayakfest.ro/despre-lacul-bicaz/ ',
        img:"/images/locatii/Barajul_laculBicaz.jpg"
    },
    { Oras: 'Sibiu ',
        Titlu_obiectiv: ' Muzeul Brukenthal ',
        Categorie: 3,
       descriere: 'Baronul Samuel von Brukenthal, fostul Guvernator al Marelui Principat al Transilvaniei ??ntre anii 1777 ??i 1787 ??i-a ridicat la Sibiu un palat care ??i poart?? numele ??i care ad??poste??te peste 800 de tablouri ??i alte obiecte de art??, dispuse ??n cele 13 s??li ale muzeului. Etajele 1 ??i 2 ale Palatului Brukenthal g??zduiesc cele mai importante galerii de art?? european?? din Rom??nia. ??n afar?? de picturi, muzeul mai de??ine ??i o colec??ie de art?? decorativ??, care con??ine piese unice precum altare, sculpturi, argint??rie laic?? sau de cult, sticl??rie, covoare orientale ??i mobilier. Tot acolo vei putea admira o bibliotec?? impresionant??, cu peste 16.000 de volume, la care s-au ad??ugat, de-a lungul anilor, colec??ii precum biblioteca capelei. Ast??zi, colec??ia de carte cuprinde peste 280.000 de volume. ',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:'https://www.brukenthalmuseum.ro/  ',
        img:"/images/locatii/MuzeulBrukenthal.jpg"
    },
    {  Oras: 'Suceava ',
        Titlu_obiectiv: 'Cet????ile Sucevei ',
        Categorie: 3,
       descriere: ' ??n ora??ul Suceava au existat dou?? dintre cele mai importante cet????i medievale din Moldova. Este vorba despre Cetatea de Scaun a Sucevei ??i Cetatea ??cheia. Acestea dateaz?? de la sf??r??itul secolului al XIV-lea ??i au fost ridicate de c??tre domnitorul rom??n Petru al II-lea Mu??at, pentru a servi drept centre de ap??rare ??mpotriva invaziei otomane. Cetatea de Scaun a Sucevei, cunoscut?? ??i ca Cetatea Sucevei, a fost inclus?? pe lista monumentelor istorice din jude??ul Suceava din anul 2004 ??i ??n urm?? cu c????iva ani a intrat ??ntr-un proces de renovare. ??n prezent, aceasta poate fi vizitat?? de turi??ti.',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:' https://muzeulbucovinei.ro/cetatea-de-scaun-a-sucevei/ ',
        img:"/images/locatii/CetatileSucevei.jpg"
    },
    {Oras: 'Teleorman',
        Titlu_obiectiv: 'Turnu M??gurele',
        Categorie: 3,
       descriere: ' Localitatea Turnu M??gurele a fost un important port din Lunca Dun??rii. Aceasta dateaz?? ??nc?? din epoca roman??. Ora??ul are o istorie bogat??, de-a lungul timpului aici fiind ridicate mai multe cet????i. Prima cetate din Turnu M??gurele a fost construit?? ??n perioada roman??, ??n jurul secolul al II-leaPe ruinele acesteia a fost ridicat??, c??teva secole mai t??rziu, cetatea lui Constantin cel Mare, ??n secolul al IV-lea. Istoria localit????ii continu?? ??i ??n Evul Mediu, pe ruinele vechilor cet????i fiind ridicat?? o nou?? cetate, ??n timpul domniei lui Mircea cel B??tr??n, care avea rol de ap??rare ??mpotriva invaziei Otomane. Aceasta a fost ??ns?? ars?? ??i din ea a r??mas doar ni??te ruine. ??n prezent ??n Turnu M??gurele se mai pot vedea o parte din zidurile cet????ii medievale. De asemenea, legendele spun c?? sub poarta cet????ii exist?? un tunel vechi de peste 2.000 de ani (n.r. din timpul romanilor), ce leag?? cele dou?? maluri ale Dun??rii. ??n afar?? de ruinele cet????ii Turnu, aici pute??i admira ??i o statuie a domnitorului Mircea cel B??tr??n ??i Bustul generalului David Praporgescu, precum ??i Monumentul Independen??ei cunoscut ??i ca Doroban??ul de la 1877. ',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:' https://ro.wikipedia.org/wiki/Turnu_M%C4%83gurele ',
        img:"/images/locatii/TurnuMagurele.jpg"
    },
     { Oras: 'Vaslui ',
        Titlu_obiectiv: 'Rezerva??ia arheologic?? Curtea Domneasc??',
        Categorie: 3,
       descriere: 'Un alt obiectiv turistic important aflat tot ??n municipiul Vaslui este Rezerva??ia arheologic?? ???Curtea Domneasc?????. Aceasta include ruinele cur??ii domne??ti din ora??, ce au fost construite ??n Evul Mediu, ??ntre anii 1472-1490, ??i biserica domneasc?? ???T??ierea Capului Sf. Ioan Botez??torul???, ce dateaz?? din aceea??i perioad??. Cetatea a fost ridicat?? ini??ial de c??tre domnitorul Alexandru cel Bun, apoi lucr??rile de extindere au fost realizate la ordinul lui ??tefan cel Mare. ??n urma s??p??turilor arheologice, aici au fost descoperite c??teva obiecte valoroase din punct de vedere artistic, printre care se remarc?? co??urile ce prezint?? scene ale vie??ii ????r??ne??ti. ??n prezent, Rezerva??ia arheologic?? ???Curtea Domneasc????? a fost restaurat?? ??i aici pot fi admirate c??teva ruine ce includ ??i zidurile cet????ii.',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:' https://planiada.ro/destinatii/vaslui/situl-arheologic-curtea-domneasca-538 ',
        img:"/images/locatii/RezervatiaCurteaDomneasca.jpg"
    },
    { Oras: 'Valcea',
        Titlu_obiectiv: 'Transalpina',
        Categorie: 3,
       descriere: 'O parte a jude??ului V??lcea este str??b??tut de una dintre cele dou?? ??osele alpine ale Rom??niei. Este vorba despre ??oseaua Transalpina, considerat?? a fi cea mai ??nalt?? ??osea din ??ara noastr??. Acesta leag?? regiunile istorice Oltenia ??i Transilvania ??i str??bate, ??n total, patru jude??e: Gorj, V??lcea, Sibiu ??i Alba. Transalpina este unul dintre drumurile montane vechi, ce str??bat Carpa??ii, despre acesta spun??ndu-se c?? a fost, ini??ial, un coridor roman. Transalpina este cunoscut?? ??i ca ???Drumul Regelui??? deoarece, ??n timpului celui de-al Doilea R??zboi Mondial, regele Carol al 2-lea a ordinat refacerea acestuia. ',
        price: '$$',
        type:"Point",
        latitude:"",
        longitude:"",
        link:' https://www.transalpina.biz/ ',
        img:"/images/locatii/transalpina.jpg"
    }

]

function make_locations(locatii)
{
    locatii.forEach( async (locatie)=>{

    const geodata  = await  geocoder.forwardGeocode({
        query: locatie.Titlu_obiectiv+ "," + locatie.Oras,
        limit:1
        }).send()
        // console.log(geodata.body.features);
        // console.log(geodata.body.features[0].geometry.coordinates)
       let longitude = geodata.body.features[0].geometry.coordinates[0];
        let latitude = geodata.body.features[0].geometry.coordinates[1];
      
        q = "INSERT INTO locatii (oras,titlu_obiectiv,categorie,descriere,price,latitude,longitude,link,img) VALUES(?,?,?,?,?,?,?,?,?)"
        db.query(q,[locatie.Oras,locatie.Titlu_obiectiv,locatie.Categorie,locatie.descriere,locatie.price,latitude,longitude,locatie.link,locatie.img],(err,rows,fields)=>{
            if(err)
            {
                console.log("avem eraore")
                throw(err);

            }
            console.log("am adaugat in " + locatie.Oras + " " + locatie.Titlu_obiectiv + " si are coord" + latitude +" "+longitude);
        })
    })
}

*/

//make_locations(obiective);

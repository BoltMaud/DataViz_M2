//----------------------------------------------------------------
// Auteurs :  Alice
// Date : Janvier 2018
//----------------------------------------------------------------

//----------------------------------------------------------------
//  Création & affichage svg à l'initialisation du jeu 
//----------------------------------------------------------------
largeurSvg = 500 ; hauteurSvg = 250;
var marges = {haut: 20, droite: 30, bas: 20, gauche: 25},
    largeur = largeurSvg - marges.gauche - marges.droite,
    hauteur = hauteurSvg - marges.haut - marges.bas;

var tooltip = d3.select('#scores').append('div')
    .attr('class', 'hidden tooltip');

var svgScores = d3.select("#scores")
    .append( "svg" )
    .attr( "width", largeurSvg )
    .attr( "height", hauteurSvg );
var s = svgScores.append("g")
    .attr("transform", "translate(" + marges.gauche+ "," + marges.haut + ")");

// couleur pour chaque moyen de transport
var c = {"T":"#4e342e", "A":"#b3e5fc", "V":"#ff9100"};

// pour les domaines et les piles
var listeTransports = ["T","A","V"];
var listeCriteres = ["prix","duree","co2"] ;

// pour les axes 
var x0 = d3.scaleBand();
var x1 = d3.scaleBand();
var y = d3.scaleLinear();


//----------------------------------------------------------------
// Création des axes du svg, une fois les scores initialisés 
//----------------------------------------------------------------
function creationAxesSvg(){

    var listeScore = Array.from({length: scores.scores.length-1}, (v, k) => k+1);

    x0
        .rangeRound([0, largeur])
        .paddingInner(0.1)
        .domain(listeScore);

    x1
        .padding(0.1)
        .domain(listeCriteres).rangeRound([10,x0.bandwidth()]);

    y
        .domain([0, 1000])
        .rangeRound([hauteur, marges.haut]);

    // création des axes
    s.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(10,"+hauteur+")")
        .call(d3.axisBottom(x0));
        
    s.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(10,0)")
        .call(d3.axisLeft(y));  

}

//----------------------------------------------------------------
// Modifie les données du svg à chaque tour
//----------------------------------------------------------------
function miseAjourSvg(){   
    
    // une section pour chaque joueur 
    for(i=0; i<scores.scores.length-1;i++){

        // on récupère le score du joueur
        var score = scores.getScore(i+1);
        var castScore = castDonnees(score);

        // pour les piles
        var section = s.append("g");

        section
            .attr("transform", "translate(" + x0(score.id) + ",0)");

        // une pile par critère (T,A,V)
        section.append("g")
            .selectAll("g")
            .data(d3.stack().keys(listeTransports)(castScore))
            .enter().append("g")
                .attr("fill", function(d) { return c[d.key]; })
            .selectAll("rect")
            .data(function(d) { return d; })
            .enter().append("rect")
                .attr("x", function(d) { return x1(d.data.index); })
                .attr("y", function(d) { return y(d[1]); })
                .attr("width", x0.bandwidth()/3)
                .attr("height", function(d) { return y(d[0])-y(d[1]); })
                .on('mousemove', function(d) {
                    var mouse = d3.mouse(section.node()).map(function(d) {
                        return parseInt(d);
                    });
                    tooltip.classed('hidden', false)
                        .attr('style', 'left:' + (mouse[0] + 15) +
                                'px; top:' + (mouse[1] - 35) + 'px')
                        .html(d.data.index +"<br/>"+ d[1]);
                })
                .on('mouseout', function() {
                    tooltip.classed('hidden', true);
                });
    }
}

//----------------------------------------------------------------
// div scores pendant le jeu
//----------------------------------------------------------------
function afficherScores(){
    document.getElementById("scores").style.visibility = "visible";
}

//----------------------------------------------------------------
// div en plein milieu de l'écran en fin de partie
//----------------------------------------------------------------
function afficherScoresFinaux(){
    console.log("finished");
    // modifier la zone d'affichage
    document.getElementById("scores").style.top = "50%";
    document.getElementById("scores").style.position = "fixed";
    document.getElementById("scores").style.left = "50%";
    document.getElementById("scores").style.width = "50%";
    document.getElementById("scores").style.transform = "translate(-50%, -50%)";
    document.getElementById("scores").style.textAlign = "center";
    // afficher la div
    document.getElementById("scores").style.visibility = "visible";
    // TODO  désactiver le mouseover du bouton Scores 
    document.getElementById("btn score").onmouseover = null ; 
    document.getElementById("btn score").onclick = null ;
}

//----------------------------------------------------------------
// cache la div
//----------------------------------------------------------------
function cacherScores(){
    console.log("out");
    document.getElementById("scores").style.visibility = "hidden";
}

//----------------------------------------------------------------
//   fonction de MàJ des scores à la fin de chaque tour
//----------------------------------------------------------------
function miseAjourScores(joueuri, d){
    var scorei = scores.getScore(joueuri.id);
    switch(d.type) {
        case "A": 
            scorei.A.prix = scorei.A.prix + d.prix ;  
            scorei.A.duree = castHeure(additionHeure(scorei.A.duree, d.duree));  
            scorei.A.co2 = scorei.A.co2 + d.co2 ;  
            break;
        case "T":
            scorei.T.prix = scorei.T.prix + d.prix ; 
            scorei.T.duree = castHeure(additionHeure(scorei.T.duree,d.duree)) ;  
            scorei.T.co2 = scorei.T.co2 + d.co2 ;              
            break;
        case "V": 
            scorei.V.prix = scorei.V.prix + d.prix ;  
            scorei.V.duree = castHeure(additionHeure(scorei.V.duree, d.duree)) ;  
            scorei.V.co2 = scorei.V.co2 + d.co2 ;  
            break;
        default:
            break;
    }
    return scorei ;    
}

//----------------------------------------------------------------
//   fonction auxiliaire pour récupérer l'heure au format minutes
//----------------------------------------------------------------
function castHeure(heure){
    if(typeof(heure)==='string'){
        var h=parseInt(heure.split("h")[0]);
        var m=parseInt(heure.split("h")[1]);
        var minutes = parseFloat(h*60 + m) ;
        return minutes ; 
    } 
    else {
        return heure ; 
    } 
}

//----------------------------------------------------------------
//   formatage des données pour les files
//----------------------------------------------------------------
function castDonnees(score){
    
    var donnees = [{"index":"prix","T":score.T.prix,"A":score.A.prix, "V":score.V.prix},
                   {"index":"duree",
                    "T":castHeure(score.T.duree),
                    "A":castHeure(score.A.duree),
                    "V":castHeure(score.V.duree)},
                   {"index":"co2","T":score.T.co2, "A":score.A.co2, "V":score.V.co2}];
    return donnees ; 
}



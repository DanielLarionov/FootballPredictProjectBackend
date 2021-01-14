const handleGetFixutres=(req,res,csv)=>{
    const{league,typetable}=req.body;
    var leagueCSVcurr,leagueCSVlast,leagueCSVfixt;
    //Assign CSV files to the league
    switch(league) {
    case "Spain":
        leagueCSVfixt = "controllers/CSVfolder/la-liga-2020.csv";
        leagueCSVlast = "controllers/CSVfolder/Spain1920.csv";
        leagueCSVcurr = "controllers/CurrentSeason/esp2020-21.csv";
        break;
    case "France":
        leagueCSVfixt = "controllers/CSVfolder/ligue-1-2020.csv";
        leagueCSVlast = "controllers/CSVfolder/France1920.csv";
        leagueCSVcurr = "controllers/CurrentSeason/frc2020-21.csv";
        break;
    case "Germany":
        leagueCSVfixt = "controllers/CSVfolder/bundesliga-2020.csv";
        leagueCSVlast = "controllers/CSVfolder/German1920.csv";
        leagueCSVcurr = "controllers/CurrentSeason/ger2020-21.csv";
        break;
    case "England":
        leagueCSVfixt = "controllers/CSVfolder/epl-2020.csv";
        leagueCSVlast = "controllers/CSVfolder/England1920.csv";
        leagueCSVcurr = "controllers/CurrentSeason/epl2020-21.csv";
        break;
    case "Italy":
        leagueCSVfixt = "controllers/CSVfolder/serie-a-2020.csv";
        leagueCSVlast = "controllers/CSVfolder/Italy1920.csv";
        leagueCSVcurr = "controllers/CurrentSeason/itl2020-21.csv";
        break;
    }
    var today = new Date();
    var dateGame = new Date();
    //Type of table
    var Cweek = new Date(today);
    if(typetable=="N"){
        Cweek.setDate(Cweek.getDate() + 7);
    }
    else{
        Cweek.setDate(Cweek.getDate() - 7);
        today.setDate(today.getDate() - 1);
        var actualResult="";
        var actualResultHAD="";
    }
    var gamesThisWeek = [];
    csv().fromFile(leagueCSVfixt).then((playingTeams)=>{
            for (var game of playingTeams)
            {
                dateGame.setDate(game.Date.substring(0, 2));
                dateGame.setFullYear(game.Date.substring(6, 10));
                dateGame.setMonth(game.Date.substring(3, 5)-1);
                if(typetable=="N"){
                    if(dateGame>=today && dateGame<=Cweek){
                        gamesThisWeek.push(game)
                    }
                }
                else{
                    if(dateGame<today && dateGame>=Cweek){
                        gamesThisWeek.push(game)
                    } 
                }
            }
            csv().fromFile(leagueCSVlast).then((stats)=>{
                csv().fromFile(leagueCSVcurr).then((statsCurrent)=>{
                    stats = stats.concat(statsCurrent);
                    var finalStats=[];
            // -------------------------------Start Loop---------------------------------------
            for(var gameInWeek of gamesThisWeek){
                //get team1 Name and team2 Name and get home games & away games
                var overallGames=stats.length;
                var overallHomeGoals=0
                var overallAwayGoals=0
                var homeTeamGames=0;
                var homeTeamGoals=0;
                var homeTeamConceded=0;
                var awayTeamGames=0;
                var awayTeamGoals=0;
                var awayTeamConceded=0;
                //get stats from CSV
                for (var stat of stats) 
                {
                    overallHomeGoals=overallHomeGoals+parseInt(stat.FTHG);
                    overallAwayGoals=overallAwayGoals+parseInt(stat.FTAG);
                    if(stat.HomeTeam==gameInWeek["Home Team"]){
                        homeTeamGames++;
                        homeTeamGoals=homeTeamGoals+parseInt(stat.FTHG);
                        homeTeamConceded=homeTeamConceded+parseInt(stat.FTAG);
                    }
                    if(stat.AwayTeam==gameInWeek["Away Team"]){
                        awayTeamGames++;
                        awayTeamGoals=awayTeamGoals+parseInt(stat.FTAG);
                        awayTeamConceded=awayTeamConceded+parseInt(stat.FTHG);
                    }
                    if(stat.HomeTeam==gameInWeek["Home Team"] && stat.Date==gameInWeek.Date.substring(0, 10)){
                        actualResult=stat.FTHG+'-'+stat.FTAG;
                        if(stat.FTHG>stat.FTAG){actualResultHAD="H"}
                        else if(stat.FTHG<stat.FTAG){actualResultHAD="A"}
                        else{actualResultHAD="D"} 
                    }
                }
                // Get home/away team strenght of attack and defence
                var homeATK=(homeTeamGoals/homeTeamGames)/(overallHomeGoals/overallGames);
                var homeDEF=(homeTeamConceded/homeTeamGames)/(overallAwayGoals/overallGames);
                var awayATK=(awayTeamGoals/awayTeamGames)/(overallAwayGoals/overallGames);
                var awayDEF=(awayTeamConceded/awayTeamGames)/(overallHomeGoals/overallGames);
                // Get Goal expectancy 
                var goalExpectancyHome = homeATK*awayDEF*(overallHomeGoals/overallGames);
                var goalExpectancyAway = awayATK*homeDEF*(overallAwayGoals/overallGames);
                // Calculate poisson distribution for goals
                //------------------calc goal expectancy---------------------------------
                var PGoalsHome=[];
                var PGoalsAway=[];
                var drawOdds=0;
                var homeWinOdds=0;
                var awayWinOdds=0;
                var maxResult=0;
                var maxResultString='';
                var i=0;
                var j=0;
                for(i=0;i<6;i++){
                    PGoalsHome[i]=Math.exp(-goalExpectancyHome)*(Math.pow(goalExpectancyHome,i)/sFact(i))
                }
                for(i=0;i<6;i++){
                    PGoalsAway[i]=Math.exp(-goalExpectancyAway)*(Math.pow(goalExpectancyAway,i)/sFact(i));
                }
                for(i=0;i<6;i++){
                    for(j=i;j<6;j++){
                        if(j==i){
                            drawOdds=drawOdds+(PGoalsAway[j]*PGoalsHome[i]); // odds of draw
                        }
                        else{
                            homeWinOdds=homeWinOdds+(PGoalsAway[i]*PGoalsHome[j]);// odds of home win
                            awayWinOdds=awayWinOdds+(PGoalsAway[j]*PGoalsHome[i]);// odds of away win
                        }
                        if(maxResult<(PGoalsAway[i]*PGoalsHome[j])){
                            maxResult=(PGoalsAway[i]*PGoalsHome[j]);
                            maxResultString= j.toString()+'-'+i.toString();
                        }
                        if(maxResult<(PGoalsAway[j]*PGoalsHome[i])){
                            maxResult=(PGoalsAway[j]*PGoalsHome[i]);
                            maxResultString= i.toString()+'-'+j.toString();
                        }
                    }
                }
                if(typetable=="N"){
                    finalStats.push([gameInWeek.Date,gameInWeek["Home Team"],gameInWeek["Away Team"],(homeWinOdds*100).toFixed(4),
                    (awayWinOdds*100).toFixed(4),(drawOdds*100).toFixed(4),maxResultString]);
                }
                else{
                    var maxOdds=0;
                    var winningOdd="";
                    var predCorrect=0;
                    maxOdds=Math.max((homeWinOdds*100).toFixed(4),(awayWinOdds*100).toFixed(4), (drawOdds*100).toFixed(4));
                    if(maxOdds==(homeWinOdds*100).toFixed(4)){winningOdd="H";}
                    else if((maxOdds==(awayWinOdds*100).toFixed(4))){winningOdd="A";}
                    else{winningOdd="D";}
                    if(actualResultHAD==winningOdd){predCorrect=1}
                    finalStats.push([gameInWeek.Date,gameInWeek["Home Team"],gameInWeek["Away Team"],winningOdd,maxResultString,actualResult,predCorrect]);
                }
            }
            //console.log(finalStats[0]);
            res.json(finalStats);
                })
            })
    })
}
function sFact(num)
{
    var rval=1;
    for (var i = 2; i <= num; i++)
        rval = rval * i;
    return rval;
}
module.exports={
    handleGetFixutres: handleGetFixutres
}
const Discord = require("discord.js");
const fs = require('fs');
const path = require('path');

const Client = new Discord.Client;
const prefix = "!";

monster = {Lvl : 0, Attack : 0, life : 0, alive : false};
let rawdata = fs.readFileSync("./Champions.json");
let Champions = JSON.parse(rawdata);
let lang = 1;
rawdata = fs.readFileSync("./Trad.json");
let trad = JSON.parse(rawdata);


function CreateMonster(lvl)
{
    if (monster.alive === true)
        return;
    monster = {Lvl : lvl, Attack : lvl * 2, life : 10 + lvl * 2, alive : true};
}

function WriteJson(Champions)
{
    fs.writeFileSync("./Champions.json", JSON.stringify(Champions));
}

/**
 * @return {boolean}
 */
function FindHero(id)
{
    i = 0;
    while (Champions.Hero[i].id !== -1) {
        if (Champions.Hero[i].id  === id)
            return true;
        i++;
    }
    return false;
}

/**
 * @return {number}
 */
function GetHeroInfo(Champions, id)
{
    i = 0;
    while (Champions.Hero[i].id !== -1) {
        if (Champions.Hero[i].id  === id)
            return i;
        i++;
    }
    return -1;
}

/**
 * @return {boolean}
 */
function CreateHero(Champions, name, id)
{
    if (FindHero(id) === true)
        return false;
    Champions.Hero.unshift({"name": name, "id": id, "xp" : 0, "lvl" : 1, "stats": {"Mana":10,"MagicPower":2,"Strenght":1,"Luck":1, "life" : 10, "maxLife" : 10}, "race" : ""});
    WriteJson(Champions);
    return true;
}

/**
 * @return {boolean}
 */
function setRace(race, id, Champions)
{
    i = GetHeroInfo(Champions, id);
    if (i === -1)
        return false;
    else
        Champions.Hero[i].race = race;
    return true;
}

function winFight(Champions)
{
    i = 0;
    while (Champions.Hero[i].id !== -1) {
        Champions.Hero[i].stats.maxLife += 1;
        Champions.Hero[i].stats.MagicPower += 1;
        Champions.Hero[i].stats.Strenght += 1;
        Champions.Hero[i].stats.Luck += 1;
        Champions.Hero[i].lvl += 1;
        Champions.Hero[i].stats.life = Champions.Hero[i].stats.maxLife;
        Champions.Hero[i].stats.Mana = 10;
        i++;
    }
}

function KnightSpell(Champions, id, message)
{
    monster.life -= Champions.Hero[id].stats.Strenght * 3;
    Champions.Hero[id].stats.life -= monster.Attack;
    if (monster.life <= 0) {
        monster.alive = false;
        message.channel.send(trad.traduction[lang].phrase[0] + Champions.Hero[id].stats.Strenght * 3 + trad.traduction[lang].phrase[1]);
        message.channel.send(trad.traduction[lang].phrase[2]);
        message.channel.send(trad.traduction[lang].phrase[3]);
        winFight(Champions);
        WriteJson(Champions);
        return;
    }
    message.channel.send(trad.traduction[lang].phrase[0] + Champions.Hero[id].stats.Strenght * 3 + trad.traduction[lang].phrase[1]);
    message.channel.send(trad.traduction[lang].phrase[4] + monster.life + trad.traduction[lang].phrase[5]);
    message.channel.send(trad.traduction[lang].phrase[6] + Champions.Hero[id].stats.life + trad.traduction[lang].phrase[7] + Champions.Hero[id].stats.Mana + trad.traduction[lang].phrase[8]);
}

function MageSpell(Champions)
{
    i = 0;
    while (Champions.Hero[i].id !== -1) {
        Champions.Hero[i].stats.life = Champions.Hero[i].stats.maxLife;
        i++;
    }
}

Client.on("ready", () => {
    console.log("bot ready")
});

Client.on("message", (message) => {
   if(message.author.bot) return;
   if (message.channel.type === "dm") return;

   userId = message.author.id;

   if (message.content === prefix + "CreateHero")
   {
       console.log(userId, message.author.username);

       let isPossibleToCreate = CreateHero(Champions, message.author.username, userId);
       if (isPossibleToCreate === true ) {
           message.channel.send(trad.traduction[lang].phrase[9] + message.author.username);
       }
       else
           message.channel.send(trad.traduction[lang].phrase[10])
   }

   if (message.content === prefix + "mage")
   {
       i = GetHeroInfo(Champions, userId);
       if (i === -1)
           return;
       if (Champions.Hero[i].race === "") {
           setRace("mage", userId, Champions);
           message.channel.send(trad.traduction[lang].phrase[11]);
           WriteJson(Champions);
           return;
       }
       message.channel.send(trad.traduction[lang].phrase[12]);
   }
   if (message.content === prefix + "knight")
   {
       i = GetHeroInfo(Champions, userId);
       if (i === -1)
           return;
       if (Champions.Hero[i].race === "") {
           setRace("knight", userId, Champions);
           message.channel.send(trad.traduction[lang].phrase[13]);
           WriteJson(Champions);
           return;
       }
       message.channel.send(trad.traduction[lang].phrase[12]);
   }

   if (message.content === prefix + "search")
   {
       i = GetHeroInfo(Champions, userId);
       if (i === -1)
       {
           message.channel.send(trad.traduction[lang].phrase[14]);
           return;
       }
       monsterLvl = Champions.Hero[i].lvl;
       CreateMonster(monsterLvl);
       message.channel.send(trad.traduction[lang].phrase[15]  + monster.life + trad.traduction[lang].phrase[16] + monster.Attack + "}")
   }

   if (message.content === prefix + "attack") {
       attacker = GetHeroInfo(Champions, userId);
       if (attacker === -1) {
           return
       }
       if (monster.alive === false) {
           message.channel.send(trad.traduction[lang].phrase[17]);
           return
       }
       monster.life = monster.life - Champions.Hero[attacker].stats.Strenght;
       Champions.Hero[attacker].stats.life -= monster.Attack;
       if (Champions.Hero[attacker].stats.life <= 0) {
           Champions.Hero[attacker] = {"name": Champions.Hero[attacker].name, "id": Champions.Hero[attacker].id, "xp" : 0, "lvl" : 1, "stats": {"Mana":10,"MagicPower":2,"Strenght":1,"Luck":1, "life" : 10, "maxLife" : 10}, "race" : ''};
           message.channel.send(trad.traduction[lang].phrase[18]);
       }
       if (monster.life <= 0) {
           monster.alive = false;
           message.channel.send(trad.traduction[lang].phrase[0] + Champions.Hero[attacker].stats.Strenght + trad.traduction[lang].phrase[1]);
           message.channel.send(trad.traduction[lang].phrase[2]);
           message.channel.send(trad.traduction[lang].phrase[3]);
           winFight(Champions);
           WriteJson(Champions);
           return;
       }
       message.channel.send(trad.traduction[lang].phrase[0] + Champions.Hero[attacker].stats.Strenght + trad.traduction[lang].phrase[1]);
       message.channel.send(trad.traduction[lang].phrase[4] + monster.life + trad.traduction[lang].phrase[5]);
       message.channel.send(trad.traduction[lang].phrase[6] + Champions.Hero[attacker].stats.life + trad.traduction[lang].phrase[7] + Champions.Hero[attacker].stats.Mana + trad.traduction[lang].phrase[8]);
       WriteJson(Champions)
   }

   if (message.content === prefix + "stats")
   {
        i = GetHeroInfo(Champions, userId);
        if (i !== -1) {
            console.log("pass");
            message.channel.send("Race : " + Champions.Hero[i].race + " {MagicPower : " + Champions.Hero[i].stats.MagicPower + ", Strenght : " + Champions.Hero[i].stats.Strenght + ", Mana : " + Champions.Hero[i].stats.Mana + ", Luck : " + Champions.Hero[i].stats.Luck + ", Life : " + Champions.Hero[i].stats.life + ", maxLife : " + Champions.Hero[i].stats.maxLife + "}")
        }
   }

   if (message.content === prefix + "heal")
   {
       attacker = GetHeroInfo(Champions, userId);
       if (attacker === -1) {
           return
       }
       console.log(Champions.Hero[attacker].stats);
       if (Champions.Hero[attacker].stats.Mana > 0) {
           message.channel.send(trad.traduction[lang].phrase[19] + Champions.Hero[attacker].stats.MagicPower + trad.traduction[lang].phrase[20]);
           Champions.Hero[attacker].stats.Mana -= 1;
           Champions.Hero[attacker].stats.life += Champions.Hero[attacker].stats.MagicPower;
           if (Champions.Hero[attacker].stats.life > Champions.Hero[attacker].stats.maxLife)
               Champions.Hero[attacker].stats.life = Champions.Hero[attacker].stats.maxLife;
       }
       else {
           message.channel.send(trad.traduction[lang].phrase[21]);
       }
       WriteJson(Champions)
   }

   if(message.content === prefix + "run") {
        monster.alive = false;
        message.channel.send(trad.traduction[lang].phrase[22])
   }
   if(message.content === prefix + "spell")
   {
        attacker = GetHeroInfo(Champions, userId);
        if (attacker === -1) {
            message.channel.send(trad.traduction[lang].phrase[23]);
            return;
        }
        if (monster.alive === false) {
            message.channel.send(trad.traduction[lang].phrase[17]);
            return;
        }
        if (Champions.Hero[attacker].race === "mage")
        {
            if (Champions.Hero[attacker].stats.Mana >= 5)
            {
                Champions.Hero[attacker].stats.Mana -= 5;
                MageSpell(Champions);
                message.channel.send(trad.traduction[lang].phrase[24]);
                WriteJson(Champions);
                return;
            }
            message.channel.send(trad.traduction[lang].phrase[25]);
            return;
        }
       if (Champions.Hero[attacker].race === "knight")
       {
           if (Champions.Hero[attacker].stats.Mana >= 5)
           {
               Champions.Hero[attacker].stats.Mana -= 5;
               KnightSpell(Champions, attacker, message);
               WriteJson(Champions);
               return;
           }
           message.channel.send(trad.traduction[lang].phrase[25]);
           return;
       }
   }
    if (message.content === prefix + "lang")
    {
        console.log(lang);
        if (lang === 0)
            lang = 1;
        else
            lang = 0;
        console.log(lang);
    }
    if (message.content === prefix + "nyanCat")
    {
        i = GetHeroInfo(Champions, userId);
        if (i === -1)
        {
            message.channel.send(trad.traduction[lang].phrase[14]);
            return;
        }
        monsterLvl = Champions.Hero[i].lvl;
        monster = {Lvl : 100, Attack : monsterLvl * 2, life : monsterLvl * 15, alive : true};
        CreateMonster(monsterLvl);
        message.channel.send("NYAAAAAAAAAN {hp :" + monster.life + trad.traduction[lang].phrase[16] + monster.Attack + "}")
    }
    if (message.content === prefix + "BOSS")
    {
        i = GetHeroInfo(Champions, userId);
        if (i === -1)
        {
            message.channel.send(trad.traduction[lang].phrase[14]);
            return;
        }
        monsterLvl = Champions.Hero[i].lvl;
        monster = {Lvl : 100, Attack : monsterLvl * 2, life : monsterLvl * 30, alive : true};
        CreateMonster(monsterLvl);
        message.channel.send("EPITECHJAMTEK3REDOUBLEMENT BOSS {hp :" + monster.life + trad.traduction[lang].phrase[16] + monster.Attack + "}")
    }
});

Client.login("ODI1MjgwNzYyOTMxODM5MDE3.YF7omg.wMzMU9rLL5pU6mB6aJLmMFksqVM");

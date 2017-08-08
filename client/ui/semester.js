import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './semester.html';
import { Blaze } from 'meteor/blaze';
import { HTTP } from 'meteor/http';
import { Session } from 'meteor/http';

// stores session for number of semesters"
if(localStorage.getItem("numberSemesters") == null) {
    localStorage.setItem("numberSemesters", 5);
}
export let numSem = 1;

Template.sem_template.onRendered(function() {
    var movingMC;
    var startSem;

    $('.module-container').sortable({
        connectWith: ".module-container",

        cancel: ".tooltiptext",
        update: function( event, ui ) {
            var id = ui.item.attr("id");
        },

        remove: function(event, ui) {
            startSem = $(this).attr("id").match(/\d/g);
            startSem = startSem.join("");
            currentMC = document.getElementById("tallyMC" + startSem).innerHTML;
            movingMC = ui.item[0].getElementsByClassName("credit")[0].innerHTML.match(/\d/g);
            movingMC = movingMC.join('');
            newMC = currentMC - movingMC;
            document.getElementById("tallyMC" + startSem).innerHTML = newMC;
            tallyColour("tallyMC" + startSem);
        },

        receive: function(event, ui) {
            let endSem = $(event.target).attr("id").match(/\d/g);
            endSem = endSem.join("");
            currentMC = document.getElementById("tallyMC" + endSem).innerHTML;
            movingMC = ui.item[0].getElementsByClassName("credit")[0].innerHTML.match(/\d/g);
            movingMC = movingMC.join('');
            newMC = parseInt(currentMC) + parseInt(movingMC);
            document.getElementById("tallyMC" + endSem).innerHTML = newMC;
            tallyColour("tallyMC" + endSem);
            
            // helps to store the session when elements are dragged
            let id = $(ui.item).attr('id');
            localStorage.setItem(id, endSem);
        }
    });

    let elem = document.getElementById("num")
    elem.id = "semNum" + numSem;
    elem.innerHTML = numSem;
    let modCon = document.getElementById("modCon");
    modCon.id = "semModContainer" + numSem;
    let tally=document.getElementById("tallyMC");
    tally.id = "tallyMC"+numSem;
    let semType = document.getElementById("semester-type-list");
    semType.id = "semester-type-list" + numSem;
    let modContext = document.getElementById("add-mod-menu");
    let contextString = "add-mod-menu-" + numSem;
    modContext.id = contextString;
    modCon.setAttribute('data-target', "#" + contextString);
    let contextAddSemTab = document.getElementById("add-mod-context-tab");
    contextAddSemTab.id = "add-mod-context-tab-" + numSem;
    contextAddSemTab.innerHTML = "Add Module to Semester #" + numSem;
    if(numSem > localStorage.getItem('numberSemesters')) {
        localStorage.setItem('numberSemesters', numSem);
    }
    numSem++;
});

function tallyColour(semID){
    let mcTally = document.getElementById(semID);
    if (mcTally.innerHTML > 25) {
        mcTally.classList.remove("classtally");
        mcTally.classList.add("overloadtally");
    } else {
        mcTally.classList.add("classtally");
        mcTally.classList.remove("overloadtally");
    }
}




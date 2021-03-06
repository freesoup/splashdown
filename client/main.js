import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http';
import { Blaze } from 'meteor/blaze';
import { Session } from 'meteor/session';

import './main.html';
import { numSem } from './ui/semester.js';
// new .js file containing module listings
import { ModuleList } from './moduleList.js';
// new .js file containing module information. 
import { ModuleInformation } from './moduleInformation.js';

createSem = function() {
    let myContainer = document.getElementById('semester-container'); 
    let addSem = document.getElementById('add-semester');
    let renderedTemplate = Blaze.render(Template.sem_template, myContainer, addSem);   
}

function createSeshModule(i, semNum) {
    let parent = document.getElementById("semModContainer" + semNum);
    Blaze.render(Template.module, parent, );
    let newMod = document.getElementById("newModule");
    newMod.prepend(ModuleInformation.data[i].ModuleCode);
    newMod.id = ModuleInformation.data[i].ModuleCode;
    modHash[ModuleInformation.data[i].ModuleCode] = semNum;
    newMod.getElementsByClassName("code")[0].innerHTML = ModuleInformation.data[i].ModuleCode;
    newMod.getElementsByClassName("title")[0].innerHTML = ModuleInformation.data[i].ModuleTitle;
    if (ModuleInformation.data[i].ModuleDescription==undefined){
        newMod.getElementsByClassName("description")[0].innerHTML="This module does not have a description"
    } else {
        newMod.getElementsByClassName("description")[0].innerHTML = ModuleInformation.data[i].ModuleDescription;
    }
    newMod.getElementsByClassName("credit")[0].innerHTML = "Modular Credits : " + ModuleInformation.data[i].ModuleCredit;
    newMod.getElementsByClassName("workload")[0].innerHTML = "Workload : " + ModuleInformation.data[i].Workload;
    if(ModuleInformation.data[i].Prerequisite==undefined) {
        newMod.getElementsByClassName("prereq")[0].style.display ='none';
        newMod.getElementsByClassName("reqtitle")[0].style.display ='none';
    } else {
        newMod.getElementsByClassName("prereq")[0].innerHTML =ModuleInformation.data[i].Prerequisite;
    }
    if(ModuleInformation.data[i].Preclusion==undefined) {
        newMod.getElementsByClassName("preclu")[0].style.display = 'none';
        newMod.getElementsByClassName("clutitle")[0].style.display ='none';
    } else {
        newMod.getElementsByClassName("preclu")[0].innerHTML =ModuleInformation.data[i].Preclusion;
    }

    for (let p = 0; p < ModuleInformation.data[i].History.length; p++) {
        if (ModuleInformation.data[i].History[p].Semester == 1) {
            newMod.getElementsByClassName("sem1")[0].style.display = 'inline-block';
            newMod.getElementsByClassName("sem1")[0].setAttribute("data-value", "true");
        }
        if (ModuleInformation.data[i].History[p].Semester == 2) {
            newMod.getElementsByClassName("sem2")[0].style.display = 'inline-block';
            newMod.getElementsByClassName("sem2")[0].setAttribute("data-value", "true");
        }
        if (ModuleInformation.data[i].History[p].Semester == 3) {
            newMod.getElementsByClassName("sem3")[0].style.display = 'inline-block';
            newMod.getElementsByClassName("sem3")[0].setAttribute("data-value", "true");
        }
        if (ModuleInformation.data[i].History[p].Semester == 4) {
            newMod.getElementsByClassName("sem4")[0].style.display = 'inline-block';
            newMod.getElementsByClassName("sem4")[0].setAttribute("data-value", "true");
        }

    }

    value = parseInt(document.getElementById("tallyMC" + semNum).innerHTML);
    value += parseInt(ModuleInformation.data[i].ModuleCredit);
    document.getElementById("tallyMC" + semNum).innerHTML = value;
    tallyColour("tallyMC" + semNum);
    checkError(newMod, "semester-type-list" + semNum);

}

Template.platform.events({
   'click #add-semester-logo'(event) {
        createSem();
   },

});

Template.platform.onRendered(function() {
    /* restores previous session for number of semesters */
    while(numSem <= localStorage.getItem("numberSemesters")) {
        createSem();
        numSem++;
    }

    if(localStorage.getItem("modList") == null) {
        localStorage.setItem("modList", " ");
    } else {
        let list = localStorage.getItem("modList").trim();
        list = list.split(' ');
        for(let j = 0; j < list.length; j++) {
            let i = parseInt(localStorage.getItem(list[j] + "Index"));
            let semNum  = parseInt(localStorage.getItem(list[j]));
            createSeshModule(i, semNum);
        }
        localStorage.setItem("modList", localStorage.getItem("modList").trim());
    }
});

/* call json */
Template.platform.onCreated(function startUp() {
});

Template.lightbox.onRendered(function() {
    let parent = document.getElementById("mod-list");
    function modules() {
        for(let i = 0; i < ModuleList.data.length; i++) {
            Blaze.render(Template.modOption, parent, );
            let createdOption = document.getElementById("mod-dud");
            createdOption.id = ModuleList.data[i].ModuleCode + "-" + i;
            createdOption.setAttribute("value", ModuleList.data[i].ModuleCode + ": " + ModuleList.data[i].ModuleTitle);
        }
    }
    modules();
});

var showDelete = false;
var semNum;
var lightBoxActive;
Template.sem_template.events({
    'click .addSem'(event) {
        semNum = event.target.id.split("-");
        semNum = semNum[semNum.length-1];
        let modContext = document.getElementById("semModContainer" + semNum);
        let lightbox = document.getElementById("lightbox");
        lightbox.classList.remove("hidden");
        lightboxActive = true;
    },
    'dblclick .module'(event) {
        event.preventDefault();
        let target = event.target;
        if(!showDelete) {
            alert("Deleting " + target.id);
        }
        semNum=target.parentNode.id.match(/\d/g);
        semNum=semNum.join("");
        targetMC = target.getElementsByClassName("credit")[0].innerHTML.match(/\d/g);
        value = document.getElementById("tallyMC" + semNum).innerHTML;
        newMC=value-targetMC;
        document.getElementById("tallyMC" + semNum).innerHTML = newMC;
        tallyColour("tallyMC" + semNum);
        delete modHash[target.id];
        target.remove();
        showDelete = true;
        let list = localStorage.getItem("modList");
        let result = "";
        list = list.split(' ');
        for(let i = 0; i < list.length; i++) {
            if(list[i] != target.id) {
                result += list[i] + " ";
            }
        }
        localStorage.setItem("modList", result);
        localStorage.removeItem(target.id);
    },
    'change .sem-type'(event) {
        let target = event.target;
        let semNumber=target.id.match(/\d/g);
        semNumber=semNumber.join("");
        checkWholeSem(semNumber);
        localStorage.setItem(target.id, target.value);
    },
});

var modHash = {};

Template.lightbox.helpers({

})




Template.lightbox.events({
    'click .search-mod'(event) {
        event.preventDefault();
        let findMod = null;
        let searchbar = document.getElementById('searchbar');
        let text = searchbar.value;
        if(text.length > 9) {
            text = text.split(':');
            text = text[0];
            if(!modHash.hasOwnProperty(text)) {
                let parent = document.getElementById("semModContainer" + semNum);
                Blaze.render(Template.module, parent, );
                let newMod = document.getElementById("newModule");
                newMod.prepend(text);
                newMod.id = text;
                modHash[text] = semNum;
                for(let i = 0; i < ModuleInformation.data.length; i++) {
                    if (ModuleInformation.data[i].ModuleCode==newMod.id) {
                        newMod.getElementsByClassName("code")[0].innerHTML = ModuleInformation.data[i].ModuleCode;
                        newMod.getElementsByClassName("title")[0].innerHTML = ModuleInformation.data[i].ModuleTitle;
                        if (ModuleInformation.data[i].ModuleDescription==undefined){
                            newMod.getElementsByClassName("description")[0].innerHTML="This module does not have a description"
                        } else {
                            newMod.getElementsByClassName("description")[0].innerHTML = ModuleInformation.data[i].ModuleDescription;
                        }
                        newMod.getElementsByClassName("credit")[0].innerHTML = "Modular Credits : " + ModuleInformation.data[i].ModuleCredit;
                        newMod.getElementsByClassName("workload")[0].innerHTML = "Workload : " + ModuleInformation.data[i].Workload;
                        if(ModuleInformation.data[i].Prerequisite==undefined) {
                            newMod.getElementsByClassName("prereq")[0].style.display ='none';
                            newMod.getElementsByClassName("reqtitle")[0].style.display ='none';
                        } else {
                            newMod.getElementsByClassName("prereq")[0].innerHTML =ModuleInformation.data[i].Prerequisite;
                        }
                        if(ModuleInformation.data[i].Preclusion==undefined) {
                            newMod.getElementsByClassName("preclu")[0].style.display = 'none';
                            newMod.getElementsByClassName("clutitle")[0].style.display ='none';
                        } else {
                            newMod.getElementsByClassName("preclu")[0].innerHTML =ModuleInformation.data[i].Preclusion;
                        }

                        for (let p = 0; p < ModuleInformation.data[i].History.length; p++) {
                                if (ModuleInformation.data[i].History[p].Semester == 1) {
                                    newMod.getElementsByClassName("sem1")[0].style.display = 'inline-block';
                                    newMod.getElementsByClassName("sem1")[0].setAttribute("data-value", "true");
                                }
                                if (ModuleInformation.data[i].History[p].Semester == 2) {
                                    newMod.getElementsByClassName("sem2")[0].style.display = 'inline-block';
                                    newMod.getElementsByClassName("sem2")[0].setAttribute("data-value", "true");
                                }
                                if (ModuleInformation.data[i].History[p].Semester == 3) {
                                    newMod.getElementsByClassName("sem3")[0].style.display = 'inline-block';
                                    newMod.getElementsByClassName("sem3")[0].setAttribute("data-value", "true");
                                }
                                if (ModuleInformation.data[i].History[p].Semester == 4) {
                                    newMod.getElementsByClassName("sem4")[0].style.display = 'inline-block';
                                    newMod.getElementsByClassName("sem4")[0].setAttribute("data-value", "true");
                                }

                            }

                        value = parseInt(document.getElementById("tallyMC" + semNum).innerHTML);
                        value += parseInt(ModuleInformation.data[i].ModuleCredit);
                        document.getElementById("tallyMC" + semNum).innerHTML = value;
                        tallyColour("tallyMC" + semNum);
                        checkError(newMod, "semester-type-list" + semNum);


                        localStorage.setItem(ModuleInformation.data[i].ModuleCode, semNum);
                        localStorage.setItem(ModuleInformation.data[i].ModuleCode + "Index", i);
                        let list = localStorage.getItem("modList");
                        list = list + " " + ModuleInformation.data[i].ModuleCode;
                        localStorage.setItem("modList", list);
                    }
                }
            } else {
                alert("module already exists");
            }
        }
        searchbar.value = '';
        let lightbox = document.getElementById('lightbox');
        lightbox.classList.add('hidden');
    },

    'click .close'(event) {
         let lightbox = document.getElementById('lightbox');
         lightbox.classList.add('hidden');
     }
});

$('.context').contextmenu();

Template.body.events({
    'click .helping'(event) {
        let helpbox = document.getElementById("helpbox");
        helpbox.classList.remove("hidden");

    },

    'click .helpclose'(event) {
        let helpbox = document.getElementById("helpbox");
        helpbox.classList.add("hidden");
    },

    'click .blogging'(event) {
        let aboutbox = document.getElementById("aboutbox");
        aboutbox.classList.remove("hidden");

    },

    'click .aboutclose'(event) {
        let aboutbox = document.getElementById("aboutbox");
        aboutbox.classList.add("hidden");
    },



});


function tallyColour(semID){
    let mcTally = document.getElementById(semID);
    if (mcTally.innerHTML > 25) {
        mcTally.classList.remove("classtally");
        mcTally.classList.add("overloadtally");
    } else {
        mcTally.classList.add("classtally");
        mcTally.classList.remove("overloadtally");
    };

}

//Tutorial Part//
var step;
Template.helpbox.onRendered(function() {
    step=0; //stepIndex 0 is step 1
    showStep(step);
});

Template.helpbox.events({
    'click .dot'(event) {
        let dot = event.target.id;
        currentStep(parseInt(dot.match(/\d/g))-1);
    },

    'click .prev'(event) {
        addStep(-1);
    },

    'click .next'(event) {
        addStep(1);
    }
});

function addStep (n) {
    step+=n;
    showStep();
}

function currentStep(n) {
    step=n;
    showStep();
}

function showStep() {

    var steps = document.getElementsByClassName("png");
    var dots = document.getElementsByClassName("dot");
    var next = document.getElementsByClassName("next");

    if (step == steps.length-1) {
        next[0].innerHTML="Close";
    } else {
        next[0].innerHTML="&#10095;"
    }
    
    if (step >= steps.length) {
        let helpbox = document.getElementById("helpbox");
        helpbox.classList.add("hidden");
        step=0;
    }

    if (step < 0) {
        step = steps.length-1;
    }
    //Updates Picture
    for (let i = 0; i < steps.length; i++) {
        if (i==step) {
            steps[i].style.display = "block";
            dots[i].classList.add("active");
        } else {
            steps[i].style.display = "none";
            dots[i].classList.remove("active");
        }
    }
}

function checkError(module, listID) {
    var semTypeList = document.getElementById(listID);
    var semType = semTypeList.options[semTypeList.selectedIndex].value;

    if (module.getElementsByClassName(semType)[0].getAttribute("data-value") == "false") {
        module.classList.add('errorMod');
    } else {
        module.classList.add('okMod');
    }
}

function checkError2(module, listID) {
    var semTypeList = document.getElementById(listID);
    var semType = semTypeList.options[semTypeList.selectedIndex].value;

    if (module.getElementsByClassName(semType)[0].getAttribute("data-value") == "false") {
        module.classList.remove("okMod");
        module.classList.add("errorMod");
    } else {
        module.classList.add("okMod");
        module.classList.remove("errorMod");
    }
}

function checkWholeSem(semNumber) {
    var semContainer = document.getElementById("semModContainer" + semNumber);
    for (let i = 0; i< semContainer.getElementsByClassName("module").length; i++) {
        checkError2(semContainer.getElementsByClassName("module")[i], "semester-type-list" + semNumber);
    }

}
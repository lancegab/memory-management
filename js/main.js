var canvas = document.getElementById("viewport");
var context = canvas.getContext("2d");

var jobs = [];
var blocks = [];

//////////////////////////////////////////////////////////////////
///////////////////////// CONSTRUCTORS ///////////////////////////

function Job(id, time, size){
    this.id = id;
    this.time = time;
    this.size = size;

    this.using = false;
}

function Memory(id, size){
    this.id = id;
    this.size = size;

    this.jobQueue = [];
}

//////////////////////////////////////////////////////////////////
/////////////////////// INITIALIZITATION /////////////////////////
var interval;

function init(type){
    jobs = [];
    blocks = [];


    clearInterval(interval);

    var mem = [9500, 7000, 4500, 8500, 3000, 9000, 1000, 5500, 1500, 500]
    var job = [
        [5, 5760],
        [4, 4190],
        [8, 3290],
        [2, 2030],
        [2, 2550],
        [6, 6990],
        [8, 8940],
        [10, 740],
        [7, 3930],
        [6, 6890],
        [5, 6580],
        [8, 3820],
        [9, 9140],
        [10, 420],
        [10, 220],
        [7, 7540],
        [3, 3210],
        [1, 1380],
        [9, 9850],
        [3, 3610],
        [7, 7540],
        [2, 2710],
        [8, 8390],
        [5, 5950],
        [10, 760],
    ]

    for(i = 0; i < job.length; i++)
        jobs.push(new Job(i, job[i][0], job[i][1]));
    for(i = 0; i < mem.length; i++)
        blocks.push(new Memory(i, mem[i]));

    switch(type){
        case "FIRSTFIT":
            interval = setInterval(function(){run("FIRST-FIT")},1000);
            break;
        case "WORSTFIT":
            jobs.sort(function(a, b) {
                return a.size - b.size;
            });
            blocks.sort(function(a, b) {
                return b.size - a.size;
            });
            interval = setInterval(function(){run("WORST-FIT")},1000);
            break;
        case "BESTFIT":
            blocks.sort(function(a, b) {
                return a.size - b.size;
            });
            interval = setInterval(function(){run("BEST-FIT")},1000);
            break;
    }
}


//////////////////////////////////////////////////////////////////
///////////////////////////// UI /////////////////////////////////

function renderUI(type){
    //function to render user interface to canvas
    context.fillStyle = "#000";
    context.fillRect(0,0,1500,760);
    context.fillStyle = "#FFF";
    context.font = "30px Arial";
    // context.fillText("Memory Blocks - " + blocks.length, 10, 40);
    // context.fillText("Jobs - " + jobs.length, 300, 40);
    // context.fillText("Waiting", 10, 450);
    context.fillText(type, 10, 40);
    context.fillText("Waiting", 10, 400);


    context.font = "15px Arial";
    for(p = 0; p < blocks.length; p++){

        if(blocks[p].jobQueue.length > 0)
            context.fillStyle = "#FF2200";
        else
            context.fillStyle = "#00AAFF";

        context.fillText("Block " + (blocks[p].id + 1) + " (" + blocks[p].size + ")", 10, 80+(p*20));

        for(q = 0; q < blocks[p].jobQueue.length; q++){
            if(q == 0)
                context.fillStyle = "#00FF00";
            else
                context.fillStyle = "#FFFF00";

            context.fillText("Job " + (blocks[p].jobQueue[q].id + 1), 10 * 15 * (q+1), 80+(p*20));
            context.fillText("(" + blocks[p].jobQueue[q].time + ")", 10 * 15 * (q+1) + 60, 80+(p*20));
        }
    }
    context.fillStyle = "#FFFF00";
    for(n=0, row=0, col=0; n < jobs.length; n++){
        if(!jobs[n].using && jobs[n].time > 0){
            context.fillText("Job " + (jobs[n].id + 1), 10 * 15 * (row) + 10, 450 + (col*20));
            context.fillText("(" + jobs[n].size + ")", 10 * 15 * (row) + 60, 450 + (col*20));
            row++;
            if(row > 10){
                row = 0;
                col ++;
            }
        }
    }
}

//////////////////////////////////////////////////////////////////
///////////////////// ALLOCATION ALGORITHM ///////////////////////

function findNewJob(i){
    for(n = 0; n < jobs.length; n++){
        if(!jobs[n].using && jobs[n].time > 0){
            if(jobs[n].size <= blocks[i].size){
                if(!jobs[n].using){
                    jobs[n].using = true;
                    blocks[i].jobQueue.push(jobs[n]);
                    break;
                }
            }
        }
    }
}

function run(type){
    console.log(jobs);
    for(i = 0; i < blocks.length; i++){
        if(blocks[i].jobQueue.length > 0){
            if(blocks[i].jobQueue[0].time == 1){
                blocks[i].jobQueue[0].time--;
                blocks[i].jobQueue[0].using = false;
                blocks[i].jobQueue.shift();
                findNewJob(i);
            } else {
                blocks[i].jobQueue[0].time--;
            }
        } else {
            findNewJob(i);
        }
    }
    renderUI(type);
}

//////////////////////////////////////////////////////////////////
////////////////////// EVENT LISTENERS ///////////////////////////

//Add functionality to HTML buttons
document.getElementById('FIRSTFIT').addEventListener('click', function(){init("FIRSTFIT")}, false);
document.getElementById('WORSTFIT').addEventListener('click', function(){init("WORSTFIT")}, false);
document.getElementById('BESTFIT').addEventListener('click', function(){init("BESTFIT")}, false);
//////////////////////////////////////////////////////////////////

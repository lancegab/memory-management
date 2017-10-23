var canvas = document.getElementById("viewport");
var context = canvas.getContext("2d");

//////////////////////////////////////////////////////////////////
///////////////////////// CONSTRUCTORS ///////////////////////////

function Job(id, time, size){
    this.id = id;
    this.time = time;
    this.size = size;

    this.using = false;
    this.waitingTime = 0;
    this.internalFragmentation = 0;
}

function Memory(id, size){
    this.id = id;
    this.size = size;

    this.job = null;
}

//////////////////////////////////////////////////////////////////
/////////////////////// INITIALIZITATION /////////////////////////
var interval;

var jobs = [];
var blocks = [];
var time = 0;
var completedJobs = 0;
var storageUsed = 0;
var storageTotal = 0;

var throughput = 0;
var storageUtilization = 0;
var waitingQueueLength = 0;
var waitingTimeInQueue = 0;
var aveInternalFragmentation = 0;

function init(type){
    jobs = [];
    blocks = [];
    time = 0;
    completedJobs = 0;
    storageUsed = 0;
    storageTotal = 0;

    throughput = 0;
    storageUtilization = 0;
    waitingQueueLength = 0;
    waitingTimeInQueue = 0;
    aveInternalFragmentation = 0;

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
    context.fillText("Block", 10, 100);
    context.fillText("Job", 10 * 15, 100);
    context.fillText("Time", 10 * (15 * 2), 100);
    context.fillText("Internal Fragmentation", 10 * (15 * 3), 100);



    for(p = 0; p < blocks.length; p++){

        if(blocks[p].job)
            context.fillStyle = "#FF2200";
        else
            context.fillStyle = "#00AAFF";

        context.fillText("Block " + (blocks[p].id + 1) + " (" + blocks[p].size + ")", 10, 120+(p*20));

        context.fillStyle = "#00FF00";

        if(blocks[p].job){
            context.fillText("Job " + (blocks[p].job.id + 1), 10 * 15, 120+(p*20));
            context.fillText(blocks[p].job.time, 10 * (15*2), 120+(p*20));
            context.fillText(blocks[p].job.internalFragmentation, 10 * (15*3), 120+(p*20));
        }
    }
    context.fillStyle = "#FFFF00";
    for(n=0, row=0, col=0; n < jobs.length; n++){
        if(!jobs[n].using && jobs[n].time > 0){
            context.fillText("Job " + (jobs[n].id + 1), 10 * 15 * (row) + 10, 450 + (col*20));
            context.fillText("(" + jobs[n].waitingTime + ")", 10 * 15 * (row) + 60, 450 + (col*20));
            row++;
            if(row > 9){
                row = 0;
                col ++;
            }
        }
    }

    context.font = "30px Arial";
    context.fillStyle = "#FFFFFF";
    context.fillText("Throughput: ", 10, 550);
    context.fillText(throughput, 510, 550);
    context.fillText("Storage Utilization: ", 10, 590);
    context.fillText(storageUtilization, 510, 590);
    context.fillText("Initial Waiting Queue Length: ", 10, 630);
    context.fillText(waitingQueueLength, 510, 630);
    // context.fillText("Waiting Time In Queue: ", 10, 670);
    // context.fillText(waitingTimeInQueue, 510, 670);
    // context.fillText("Internal Fragmentation: ", 10, 710);
    // context.fillText(aveInternalFragmentation, 510, 710);

}

//////////////////////////////////////////////////////////////////
///////////////////// ALLOCATION ALGORITHM ///////////////////////

function findNewJob(i){
    for(n = 0; n < jobs.length; n++){
        if(!jobs[n].using && jobs[n].time > 0){
            if(jobs[n].size <= blocks[i].size){
                if(!jobs[n].using){
                    jobs[n].using = true;
                    blocks[i].job = jobs[n];
                    jobs[n].internalFragmentation = blocks[i].size - jobs[n].size;
                    storageUsed += jobs[n].size;
                    break;
                }
            }
        }
    }
}

function findWaiting(){
    w = 0;
    for(n = 0; n < jobs.length; n++){
        if(!jobs[n].using)
            w++;
    }

    return w;
}

function incrementWaiting(){
    for(n = 0; n < jobs.length; n++){
        if(!jobs[n].using)
            jobs[n].waitingTime++;
    }
}

function findStorageTotal(){
    var t = 0;

    for(i = 0; i < blocks.length; i++){
        t += blocks[i].size;
    }

    return t;
}

function isFinished(){
    for(n = 0; n < jobs.length; n++){
        if(jobs[n].using)
            return false;
    }

    return true;
}


function run(type){
    for(i = 0; i < blocks.length; i++){
        if(blocks[i].job){
            if(blocks[i].job.time == 1){
                blocks[i].job.time--;
                blocks[i].job.using = false;
                blocks[i].job = null;
                completedJobs ++;
                findNewJob(i);
            } else {
                blocks[i].job.time--;
            }
        } else {
            findNewJob(i);
        }
    }
    incrementWaiting();

    if(time == 1){
        //waitingQueueLength;
        waitingQueueLength = findWaiting();
    }
    //throughput
    throughput = completedJobs / time;
    //storageUtilization
    storageUtilization = findStorageTotal()/storageUsed * 100;


    if(!isFinished()){
        time ++;
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

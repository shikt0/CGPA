

function addCourse() {
  const div = document.createElement("div");
  div.className = "card card-body bg-white shadow-xl rounded-2xl flex flex-wrap gap-4";

  div.innerHTML = `
    <input placeholder="Course Name (Optional)" 
    class="input input-bordered w-full md:w-1/2">

    <input type="number" placeholder="Credit" 
    class="credit input input-bordered w-full md:w-1/6">

    <div class="w-full md:w-1/6 flex items-center gap-2">
      <input type="number" placeholder="Marks" 
      class="marks input input-bordered flex-1"
      oninput="detectLetter(this)">
      <span class="detected font-semibold text-indigo-700"></span>
    </div>

    <input type="number" placeholder="Retake Marks (Optional)" 
    class="retake input input-bordered w-full md:w-1/6">
  `;

  document.getElementById("courses").appendChild(div);
}

function gradeFromMarks(marks){
  if(marks>=80) return 4.0;
  if(marks>=75) return 3.75;
  if(marks>=70) return 3.5;
  if(marks>=65) return 3.25;
    if(marks>=60) return 3.0;
    if(marks>=55) return 2.75;
    if(marks>=50) return 2.50;
    if(marks>=45) return 2.25;
    if(marks>=40) return 2.0;

  return 0.0;
}

function gradeToLetter(gp){
  const map={
    4.0:"A+",
    3.75:"A",
    3.50:"A-",
    3.25:"B+",
    3.0:"B",
    2.75:"B-",
    2.50:"C+",
    2.25:"C",
    2.0:"D",
    0.0:"F"
  };
  return map[gp] ?? "";
}

function detectLetter(input){
  const mark = parseFloat(input.value);
  if(isNaN(mark)){
    input.nextElementSibling.innerText="";
    return;
  }
  const gp = gradeFromMarks(mark);
  input.nextElementSibling.innerText = " → " + gradeToLetter(gp);
}

function calculateCGPA(){
  const credits = document.querySelectorAll(".credit");
  const marks = document.querySelectorAll(".marks");
  const retakes = document.querySelectorAll(".retake");

  let totalCredits=0;
  let totalPoints=0;
  let failCount=0;
  let earnedCredits=0;

  for(let i=0;i<credits.length;i++){
    let credit=parseFloat(credits[i].value);
    let mark=parseFloat(marks[i].value);
    let retake=parseFloat(retakes[i].value);

    if(isNaN(credit)||isNaN(mark)) continue;

    let gpOriginal=gradeFromMarks(mark);
    let gpFinal=gpOriginal;

    if(!isNaN(retake)){
      let gpRetake=gradeFromMarks(retake);
      gpFinal=Math.max(gpOriginal,gpRetake);
    }

    if(gpFinal===0) failCount++;
    else earnedCredits+=credit;

    totalCredits+=credit;
    totalPoints+=credit*gpFinal;
  }

  if(totalCredits===0) return;

  document.getElementById("result").innerText=
    "CGPA: "+(totalPoints/totalCredits).toFixed(2);

  document.getElementById("credits").innerText=
    "Earned Credits: "+earnedCredits;

  const failEl=document.getElementById("failWarning");

  if(failCount>0){
    failEl.innerText="⚠ You still have "+failCount+" failed course(s).";
    failEl.className="text-red-600 font-bold";
  } else {
    failEl.innerText="All courses passed ✔";
    failEl.className="text-green-600 font-bold";
  }
}

function saveSemester(){
  localStorage.setItem("cgpaData",document.getElementById("courses").innerHTML);
  alert("Semester Saved!");
}

function loadSemester(){
  document.getElementById("courses").innerHTML=
    localStorage.getItem("cgpaData") || "";
}

addCourse();


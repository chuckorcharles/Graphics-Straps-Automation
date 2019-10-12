#include "json2.jsx"

// global vars
var path = new File("~/Documents/Graphics Projects/Scripts");
var file = null;
var TempFileSelection = null;
var TempTitleEng, TempTitleChi;
var NumCreated = 0;
var fileLocBox;

function IPP (HouseNum, TitleEng, Day, Time, TitleChi){
    this.HouseNum = HouseNum;
    this.TitleEng = TitleEng;
    this.Day = Day;
    this.Time = Time;
    this.TitleChi = TitleChi;
    this.DayOfWeek = ""
}

//check if the title is long by putting them onto the Check Text Size comp with expression that measures the text size with SourceRectatTime
IPP.prototype.IsLongEngTitle = function(){

    var CheckTextSizeLayerEng = CompByName("Check Text Size").layer(2);
    var RectSizeEng = CompByName("Check Text Size").layer(3).property("Contents").property(1).property("Contents").property(1).property("Size");

    CheckTextSizeLayerEng.property("Text").property("Source Text").setValue(this.TitleEng);

    if (RectSizeEng.value[0]>374){
        return true;
    }else{
        return false;
    }
}

//check if the title is long by putting them onto the Check Text Size comp with expression that measures the text size with SourceRectatTime
IPP.prototype.IsLongChiTitle = function(){
    var CheckTextSizeLayerChi = CompByName("Check Text Size").layer(1);
    var RectSizeChi = CompByName("Check Text Size").layer(4).property("Contents").property(1).property("Contents").property(1).property("Size");

    CheckTextSizeLayerChi.property("Text").property("Source Text").setValue(this.TitleChi);

    if (RectSizeChi.value[0]>374){
        return true;
    }else{
        return false;
    }
}

IPP.prototype.CompToUse = function(){

    //identify which comp to use by a binary decision tree algorithm, eg. check whether it's XPP, then whether it's HD, long title, etc.

    var Identifier = 0;
    var EngTitleIsLong = this.IsLongEngTitle();
    var ChiTitleIsLong = this.IsLongChiTitle();

    if (this.HouseNum.toUpperCase().indexOf("XPP") != -1){  //CHECK IF IT'S XPP, USING HOUSE NUMBER
        Identifier = Identifier+4;

        if (this.TitleChi){                             //CHECK WHETHER THERE'S CHINESE TITLE
            if (EngTitleIsLong || ChiTitleIsLong){
                Identifier = Identifier+2;

                if (this.IsHD()){                          //CHECK IF IT'S HD
                    Identifier = Identifier+1;
                }
            } else {
                var CCode = this.HouseNum.toUpperCase().substr(0,2);

                if (this.IsHD()){                          //CHECK IF IT'S HD
                    Identifier = Identifier+1;
                }
            }
        } //else {
          //  alert ("it's not ONE INDO but Chinese title is missing. Please check.")
          //  throw new Error();
        //}

    } else {                                                //in the case where it's not XPP

        if (this.HouseNum.toUpperCase().substr(0,2) == "52"){ //CHECK IF IT'S ONE INDO, USING HOUSE NUMBER
            Identifier = Identifier+2;

            if (EngTitleIsLong){                            //CHECK IF IT'S LONG TITLE. ONLY check Eng title as ONE INDO HAS NO English title
                Identifier = Identifier+1;
            }
        } else {                                            //Now that it's not ONE INDO

            if (this.TitleChi){                             //CHECK WHETHER THERE'S CHINESE TITLE
                if (EngTitleIsLong || ChiTitleIsLong){
                    Identifier = Identifier+1;
                } else {
                }
            } //else {
                //    alert ("it's not ONE INDO but Chinese title is missing. Please check.")
                //    throw new Error();
            //}
        }
    }
    return Identifier;
}

IPP.prototype.IsHD = function(){

    var ChannelCode = this.HouseNum.toUpperCase().substr(0,2);
    switch (ChannelCode) {
        case "11":
        case "21":
        case "41":
            return false;
            break;
        default:
            return true;
            break;
    }
}

// UI

function BuildUI(){
var mainWindow = new Window("palette", "File Reader", undefined);
mainWindow.orientation = "column";

var groupOne = mainWindow.add("group", undefined, "groupOne");
groupOne.orientation = "row";
fileLocBox = groupOne.add("edittext", undefined, "Selected File Location");
fileLocBox.size = [150, 20];
var getFileButton = groupOne.add("button", undefined, "File...");
getFileButton.helpTip = "Select a .txt, .json, or .xml file to change the comp";
// myEditText = groupOne.add("edittext", undefined);
var groupTwo = mainWindow.add("group", undefined, "groupTwo");
groupTwo.orientation = "row";
var applyButton = groupTwo.add("button", undefined, "Apply");

getFileButton.onClick = OpenFileDialog;
applyButton.onClick = Main;

return mainWindow;
}



function OpenFileDialog(e){

        TempFileSelection = path.openDlg("Open a file", "Acceptable Files:*.csv,*.json,*xml");

        if (TempFileSelection == null) {
            return false;
        } else {
            file = TempFileSelection;
            fileLocBox.text = file.fsName;
        }

}


function Main(e) {
        if(file == null) {
              return false;
        } else {
              var fileExtension = fileLocBox.text;
              var fileData;
              if(fileExtension.substring(fileExtension.length-4, fileExtension.length) == "json") {
                  fileData = readJson();
              } else {
                      switch(fileExtension.substring(fileExtension.length-3, fileExtension.length)) {
                          case "csv":
                              fileData = readCsv();
                          break;
                          case "xml":
                              fileData = readXml();
                          break;
                      }
              }

              var longString = fileData.toString();

              var lines = longString.split('\n');  // split the lines (windows should be '\r')

              var FirstLine = lines[0].split(',');  //check to see if first English title is empty. If so, try to throw an exception

              if (FirstLine[2] == ""){
                  alert ("I see empty title");
                  throw new Error();
              } else {
                  TempTitleEng = FirstLine[2];
              }

              //Handle each line
              for (var i=0; i<lines.length; i++){

                  var line = lines[i].split(",");

                  if (line[2] == ""){
                      line[2] = TempTitleEng;
                  } else {
                      TempTitleEng = line[2];
                  }

                  //create a new IPP object with info from the current line
                  if (line.length == 7){
                      var CurrentIPP = new IPP (line[0],line[2],line[4],line[5],line[6]);
                  } else {
                      var CurrentIPP = new IPP (line[0],line[2],line[4],line[5],null);
                  }


                  if (DayFormatting(CurrentIPP.Day)[0] == "Date"){            //Check if current date/day column type is date (premiere dated version)

                      var NextNextLine = lines[i+2].split(",");               //If so, access next next line's date/day column to assign the day of week info to CurrentIPP.DayOfWeek
                      var NextNextIPP = new IPP(NextNextLine[0],NextNextLine[2],NextNextLine[4],NextNextLine[5],NextNextLine[6]);


                      if (DayFormatting(NextNextIPP.Day)[0] == "Day"){
                          CurrentIPP.DayOfWeek = DayFormatting(NextNextIPP.Day)[1];
                      }
                  }

                  //Reformat Day
                  CurrentIPP.Day = DayFormatting(CurrentIPP.Day)[1];

                  //Reformat time
                  CurrentIPP.Time = TimeFormatting(CurrentIPP.Time);

                  //Identify which comp to use
                  var CompID = CurrentIPP.CompToUse();

                  //Reformat English title to 2-line if it's long
                  if (CurrentIPP.IsLongEngTitle()){
                      CurrentIPP.TitleEng = SplitTitle(CurrentIPP);
                  }

                  //Reformat Chinese title to 2-line if it's long
                  if (CurrentIPP.IsLongChiTitle()){
                      CurrentIPP.TitleChi = SplitChiTitle(CurrentIPP);
                  }

                  if (CurrentIPP.HouseNum) {                                  //Check if house number is present

                      //call the Duplicate Comp function with the respective comp names identified by the Identifier (CompID)
                      switch (CompID) {
                          case 0: DuplicateComp("IPP_Layout_NormalTitle_Footage", "Show_Title_Normal", "Show_Date_Day", "Show_Time", CurrentIPP);
                              break;
                          case 1: DuplicateComp("IPP_Layout_LongTitle_Footage", "Show_Title_Long", "Show_Date_Day", "Show_Time", CurrentIPP);
                              break;
                          case 2: DuplicateComp("IPP_Layout_NormalTitle_Indo_Footage", "Show_Title_Normal_Indo", "Show_Day_Indo", "Show_Time", CurrentIPP);
                              break;
                          case 3: DuplicateComp("IPP_Layout_LongTitle_Indo_Footage", "Show_Title_Long_Indo", "Show_Day_Indo", "Show_Time", CurrentIPP);
                              break;
                          case 4: DuplicateComp("IPP_Layout_NormalTitle_Footage_XXX", "Show_Title_Normal", "Show_Date_Day", "Show_Time", CurrentIPP);
                                  //DuplicateToSD()  ---------TO BE COMPLETED!! IPP_Layout_NormalTitle_XXX_Footage_SD
                              break;
                          case 5: DuplicateComp("IPP_Layout_NormalTitle_Footage_XXX", "Show_Title_Normal", "Show_Date_Day", "Show_Time", CurrentIPP);
                              break;
                          case 6: DuplicateComp("IPP_Layout_LongTitle_Footage_XXX", "Show_Title_Long", "Show_Date_Day", "Show_Time", CurrentIPP);
                                  //DuplicateToSD()  ---------TO BE COMPLETED!! IPP_Layout_LongTitle_XXX_Footage_SD
                              break;
                          case 7: DuplicateComp("IPP_Layout_LongTitle_Footage_XXX", "Show_Title_Long", "Show_Date_Day", "Show_Time", CurrentIPP);
                      }
                  } else {
                      alert ("Empty Line!!!!");
                      throw new Error();
                  }
                }
            }
        MainUI.hide();
        alert(NumCreated.toString() + " IPPs created. Please check RENDER folder.");
        file = null;
        NumCreated = 0;
}

try {

var MainUI = BuildUI();

MainUI.center();
MainUI.show();

}
catch (err){
    alert ("Error LAH! ->");
}

function FolderByName(FolderName){
    var FolderFound = null;
    for (var i = 1; i <= app.project.numItems; i++){
        if ((app.project.item(i) instanceof FolderItem) && (app.project.item(i).name == FolderName)){
            FolderFound = app.project.item(i);
            break;
        }
    }
    if (FolderFound){
        return FolderFound;
    } else {
        return null;
    }
}

function CompByName(CompName){
    var CompFound = null;
    for (var i = 1; i <= app.project.numItems; i++){
        if ((app.project.item(i) instanceof CompItem) && (app.project.item(i).name == CompName)){
            CompFound = app.project.item(i);
            break;
        }
    }
    if (CompFound){
        return CompFound;
    } else {
        return null;
    }
}

function DuplicateComp(NameOfComp, NameOfTitlePreComp, NameOfDayPreComp, NameOfTimePreComp, CurrentIPP){

                var RenderFolder = null;
                var PreCompFolder = null;
                var DayPreComp = CompByName(NameOfDayPreComp);
                var TitlePreComp = CompByName(NameOfTitlePreComp);
                var TimePreComp = CompByName(NameOfTimePreComp);
                var CurrentHouseNum = CurrentIPP.HouseNum;

                //check if "Render" and "PreComp TEMP" folder exists. If so, assign them to the variables
                if (FolderByName("Render")){
                    RenderFolder = FolderByName("Render");
                } else {
                    RenderFolder = app.project.items.addFolder("Render");
                }

                if (FolderByName("PreComp TEMP")){
                    PreCompFolder = FolderByName("PreComp TEMP");
                } else {
                    PreCompFolder = app.project.items.addFolder("PreComp TEMP");
                }

                //Update precomps with CurrentIPP's info

                //Check if the IPP Comp (with the current house number as comp name) already exist.
                //If so, remove it first, then duplicate the respective IPP comp, rename it as current house number,
                //and move to the Render folder.

                if (CompByName(CurrentHouseNum.toUpperCase())){
                    CompByName(CurrentHouseNum.toUpperCase()).remove();
                }

                //Update Title Precomp text layer
                TitlePreComp.layer(1).property("Text").property("Source Text").setValue(CurrentIPP.TitleChi);
                TitlePreComp.layer(2).property("Text").property("Source Text").setValue(CurrentIPP.TitleEng);

                //Update Date/Day Precomp text layer
                if (NameOfDayPreComp == "Show_Day_Indo"){                     //FOR INDO VERSION
                    if (CurrentIPP.DayOfWeek !== ""){                         //for the case of DATE version
                      DayPreComp.layer(1).enabled = true;
                      DayPreComp.layer(2).enabled = true;
                      DayPreComp.layer(3).enabled = true;
                      DayPreComp.layer(4).enabled = false;
                      DayPreComp.layer(1).property("Text").property("Source Text").setValue(CurrentIPP.Day);
                      DayPreComp.layer(2).property("Text").property("Source Text").setValue(CurrentIPP.DayOfWeek);
                      CurrentIPP.DayOfWeek = "";
                    } else {                                                  //for the case of Day of week version
                      DayPreComp.layer(1).enabled = false;
                      DayPreComp.layer(2).enabled = false;
                      DayPreComp.layer(3).enabled = false;
                      DayPreComp.layer(4).enabled = true;
                      DayPreComp.layer(4).property("Text").property("Source Text").setValue(CurrentIPP.Day);
                    }
                } else {                                                      //FOR EA VERSION
                    if (CurrentIPP.DayOfWeek !== ""){                         //for the case of DATE version
                      DayPreComp.layer(1).enabled = true;
                      DayPreComp.layer(2).enabled = true;
                      DayPreComp.layer(3).enabled = true;
                      DayPreComp.layer(4).enabled = false;
                      DayPreComp.layer(5).enabled = false;
                      DayPreComp.layer(6).enabled = true;
                      DayPreComp.layer(7).enabled = true;
                      DayPreComp.layer(1).property("Text").property("Source Text").setValue(CurrentIPP.Day);
                      DayPreComp.layer(2).property("Text").property("Source Text").setValue(CurrentIPP.DayOfWeek);
                      CurrentIPP.DayOfWeek = "";
                    } else {                                                  //for the case of Day of week version
                      DayPreComp.layer(1).enabled = false;
                      DayPreComp.layer(2).enabled = false;
                      DayPreComp.layer(3).enabled = false;
                      DayPreComp.layer(4).enabled = true;
                      DayPreComp.layer(5).enabled = true;
                      DayPreComp.layer(6).enabled = false;
                      DayPreComp.layer(7).enabled = false;
                      DayPreComp.layer(4).property("Text").property("Source Text").setValue(CurrentIPP.Day);
                    }
                }

                //Update Time Precomp text layer
                TimePreComp.layer(2).property("Text").property("Source Text").setValue(CurrentIPP.Time);

                var newIPPComp = CompByName(NameOfComp).duplicate();
                newIPPComp.name = CurrentHouseNum.toUpperCase();
                newIPPComp.parentFolder = RenderFolder;

                //Duplicate Show Title Precomp
                var newTitlePrecomp = TitlePreComp.duplicate();
                newTitlePrecomp.name = CurrentHouseNum.toUpperCase() + "_" + NameOfTitlePreComp;
                newTitlePrecomp.parentFolder = PreCompFolder;

                //Duplicate Show Day Precomp
                var newDayPrecomp = DayPreComp.duplicate();
                newDayPrecomp.name = CurrentHouseNum.toUpperCase() + "_" + NameOfDayPreComp;
                newDayPrecomp.parentFolder = PreCompFolder;

                 //Duplicate Show Time Precomp
                var newTimePrecomp = TimePreComp.duplicate();
                newTimePrecomp.name = CurrentHouseNum.toUpperCase() + "_" + NameOfTimePreComp;
                newTimePrecomp.parentFolder = PreCompFolder;

                //Replace the respective layers in the new IPP comp (with house number as comp name)
                newIPPComp.layer(11).replaceSource(newTitlePrecomp,true);
                newIPPComp.layer(9).replaceSource(newDayPrecomp,true);
                newIPPComp.layer(7).replaceSource(newTimePrecomp,true);

                NumCreated = NumCreated + 1;
}


//this function takes the text field of the date/day column and return an array
//with elements Type (Date, Day or Tonight), Main text (eg. 02/04, TUE & WED, TONIGHT, etc)
//and Subtext which is the day for premiere dated versions
function DayFormatting(CurrentIPPDay){

    var MonthRegExp = /MON|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC/;
    var DayRegExp = /MON|TUE|WED|THU|FRI|SAT|SUN/;
    var TonRegExp = /TON/;
    var DateRegExp = /\d+/;
    var Type, MainText, SubText;
    var MonthDict = {
        "MON":"01", "FEB":"02", "MAR":"03", "APR":"04", "MAY":"05", "JUN":"06", "JUL":"07", "AUG":"08", "SEP":"09"
    };
    var CurrentIPPDayUpper = CurrentIPPDay.toUpperCase();

    if (MonthRegExp.test(CurrentIPPDayUpper)){

        Type = "Date";
        var MonthMatch = CurrentIPPDayUpper.match(MonthRegExp);
        var DateMatch = CurrentIPPDayUpper.match(DateRegExp);

        if (DateMatch[0] && MonthMatch[0]) {

            if (DateMatch[0].length == 1){                              //Check if date is one-digit, if so, prefix it with "0"
                DateMatch[0] = "0" + DateMatch[0];
            }
            MainText = DateMatch[0] + "/" + MonthDict[MonthMatch[0]];
        } else {
            alert ("INVALID FORMAT for the Date/Day column, PROBABLY. Please Check.");
        }

    } else if (DayRegExp.test(CurrentIPPDayUpper)){

        Type = "Day";
        MainText = CurrentIPPDayUpper;                          //returning the string itself for case of day, relying on input data

    } else if (TonRegExp.test(CurrentIPPDayUpper)){

        Type = "Tonight";
        MainText = CurrentIPPDayUpper;                          //returning the string itself for case of TONIGHT, relying on input data

    } else {
        return "Invalid";
    }
    return [Type, MainText];
}

//Split long titles into 2 lines, return the a 2-line title with line break
function SplitTitle(LocalIPP){
    var WordsSeparated = LocalIPP.TitleEng.split(" ");
    var FirstLine, SecondLine;
    var SliceArray;

    for (var i=WordsSeparated.length-1; i>=1; i--){
    //iterate thru the words array from the end, take out one word at a time and check if first line falls within the length limit (374 pixels)

        SliceArray = WordsSeparated.slice(0,i);

        LocalIPP.TitleEng = SliceArray.join(" ");

        if (LocalIPP.IsLongEngTitle()){
            continue;
        } else {
            FirstLine = SliceArray.join(" ");
            SecondLine = WordsSeparated.slice(i,WordsSeparated.length).join(" ");
            break;
        }
    }
    return FirstLine + "\n" + SecondLine;
}

//Split long titles into 2 lines, return the a 2-line title with line break
function SplitChiTitle(LocalIPP){
    var WordsSeparated = LocalIPP.TitleChi.split("");
    var FirstLine, SecondLine;
    var SliceArray;

    for (var i=WordsSeparated.length-1; i>=1; i--){
    //iterate thru the words array from the end, take out one word at a time and check if first line falls within the length limit (374 pixels)

        SliceArray = WordsSeparated.slice(0,i);

        LocalIPP.TitleChi = SliceArray.join("");

        if (LocalIPP.IsLongChiTitle()){
            continue;
        } else {
            FirstLine = SliceArray.join("");
            SecondLine = WordsSeparated.slice(i,WordsSeparated.length).join("");
            break;
        }

    }
    return FirstLine + "\n" + SecondLine;
}


//this function take the text field of the time column and return the correct format for our IPP, or "INVALID" if time input format is invalid
function TimeFormatting(CurrentIPPTime){
	var TimeRegExp = /\d+:?\.?(\d+)?(AM)|(PM)/;
	var SeparatorRegExp = /:|\./;
	var HourRegExp = /\d+(:|\.)/;
	var MinuteRegExp = /(:|\.)(\d+)?/;
  var PMRegExp = /PM/;
	var CurrentIPPTimeUpper = CurrentIPPTime.toUpperCase();
	var HourText, MinuteText;

	if (TimeRegExp.test(CurrentIPPTimeUpper)){
		if (SeparatorRegExp.test(CurrentIPPTimeUpper)){							//check if there's separator (: or .)
			var HourMatch = CurrentIPPTimeUpper.match(HourRegExp);
			var MinuteMatch = CurrentIPPTimeUpper.match(MinuteRegExp);
			HourText = HourMatch[0].substring(0, HourMatch[0].length-1);  			//omit the last character of the HourMatch string (omitting ":" or ".")
			MinuteText = MinuteMatch[0].substring(1);    						//omit the first character of the MinuteMatch string (omitting ":" or ".")

			if (MinuteText == "") { 											//Handle the extreme case whereby Minute Text is null (eg. 11.AM)
				MinuteText = "00";
			}
		} else {
			var HourMatch = CurrentIPPTimeUpper.match(/\d+/);
			HourText = HourMatch[0];
			MinuteText = "00";
		}

    //Convert 12-hour format to 24-hour format
		if (PMRegExp.test(CurrentIPPTimeUpper)){
				var NewHour = parseInt(HourText,10) + 12;
				HourText = NewHour.toString();
    }
	} else {
    return "Invalid";
	}
  return HourText + ":" + MinuteText;
}


function readCsv() {

        file.encoding = 'UTF8'; // set some encoding
        file.lineFeed = 'Macintosh'; // set the linefeeds
        file.open("r");
        var content = file.read(); // get the text in it
        file.close(); // close it again
        return content;
}

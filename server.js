var express = require("express");
var fileuploader = require("express-fileupload");
var mysql2 = require("mysql2");
var cloudinary = require("cloudinary").v2;

var app = express();


app.listen(2005, function () {
  console.log("Server Started at Port no: 2005")
})
app.use(fileuploader());

app.use(express.urlencoded({ extended: true })); //convert POST data to JSON object


//----------------------------------------------


cloudinary.config({
  cloud_name: 'djetpcjtm',
  api_key: '392314433632311',
  api_secret: '6m_fvnonsaEu2IaaQX_AMwuNgvs'
});
//---------------
app.get("/hello", function (_req, resp) {
  resp.contentType("text/html");
  resp.write("hellooo!!!");
  resp.end();
})
//----------
app.use(express.static("PUBLIC"));

app.get("/", function (_req, resp) {
  console.log(__dirname);
  let path = __dirname + "/public/index.html";
  resp.sendFile(path);
})
//==========Aiven started===============
let dbconf = "mysql://avnadmin:AVNS_PURkOvHiyQ1fz7OmUK8@mysql-3852703c-codersohani12-fb67.e.aivencloud.com:17347/defaultdb?";
let mySqlVen = mysql2.createConnection(dbconf);//now to create connnection with aiven jb node mein hum kuch kre voh sidha aiven pr chle;
mySqlVen.connect(function (errKuch) {// err property is must to give so that we can check ki node ka connection with mysql huya ya nhi
  if (errKuch == null)
    console.log("Aiven connection successfully........");
  else
    console.log(errKuch);
})


//=============================================

app.get("/server-signup", function (req, resp) {
  let email = req.query.txtEmail;
  let password = req.query.txtPwd;
  let usertype = req.query.comboCol;
  console.log(usertype);
  mySqlVen.query("insert into users values(?,?,?,current_date(),1)", [email, password, usertype], function (errKuch) {
    if (errKuch == null)
      resp.send("Record Saved Successfulllyyy....Badhai");

    else
      resp.send(errKuch.message);
  })
})


//=========================== Login =======================================//

app.get("/do-login", function (req, resp) {
  let email = req.query.txtEmail2;
  let password = req.query.txtPwd2;
  console.log(email);

  mySqlVen.query("select * from users where email=? and password=?", [email, password], function (err, allRecords) {


    if (err) {
      console.error("SQL error:", err);
      resp.status(500).send("Server error");
      return;
    }

    if (allRecords.length === 1) {
      resp.send(allRecords[0].usertype);
    } else {
      resp.send("Invalid user");
    }

    //     // if (allRecords.length == 0) {

    //     //   resp.send("Invalid ");
    //     // }

    //     // else

    //  if (allRecords[0].status == 1) {
    //       resp.send(allRecords[0].usertype);
    //     }
    //     else
    //       resp.send("Blocked");

    //     /*if (allRecords.length == 1) {
    //       let status = allRecords[0].status;

    //       if (status == 0)
    //         resp.json(" You are Blocked");
    //       else if (status == 1)
    //         resp.json("Login Succesful");

    //     }
    //     else {
    //       resp.json("Wrong emailid or password");
    //     }*/

  });
})



//================================ organizer=========================//
app.post("/org-signup", async function (req, resp) {
  //resp.send(req.query);
  // console.log(req.query.email + "," + req.query.orgName);

  let emailid = req.body.txtmail;
  console.log(emailid);
  let orgname = req.body.orgName;
  let regno = req.body.regNo;
  let address = req.body.add;
  let city = req.body.city;
  let sports = req.body.sport;
  let website = req.body.web;
  let insta = req.body.instaLink;
  let orghead = req.body.orgHead;
  let contact = req.body.contact;
  let otherinfo = req.body.otherInfo;

  let picurl = "";
  if (req.files != null) {
    let fName = req.files.profilePic.name;
    let fullPath = __dirname + "/public/uploads/" + fName;
    req.files.profilePic.mv(fullPath);

    await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
      picurl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server

      console.log(picurl);
    });
  }
  else
    picurl = "no pic.jpg";


  mySqlVen.query("insert into organizers values (?,?,?,?,?,?,?,?,?,?,?,?)", [emailid, orgname, regno, address, city, sports, website, insta, orghead, contact, picurl, otherinfo], function (errKuch) {



    if (errKuch == null)
      resp.send(" ✅ Record Saved Successfulllyyy....");

    else
      resp.send(errKuch);
  })


})




/*app.get("/orgdetails-page", function (req, resp) {
  console.log(__dirname);
  let path = __dirname + "/public/org-details.html";
  resp.sendFile(path);
  console.log("server started")
})*/


app.get("/do-tournament", function (req, resp) {
  //resp.send(req.query);
  console.log(req.query);

  let emailid = req.query.txtEmail;
  let eventtitle = req.query.txtEvent;
  let doe = req.query.txtDate;
  let toe = req.query.txtTime;
  let address = req.query.txtAddress;
  let city = req.query.txtCity;
  let sports = req.query.txtCombo;
  let minage = req.query.txtMinage;
  let maxage = req.query.txtMaxage;
  let lastdate = req.query.txtRegister;
  let fees = req.query.txtFees;
  let prize = req.query.txtMoney;
  let contact = req.query.txtContact;

  mySqlVen.query("insert into tournaments values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [null, emailid, eventtitle, doe, toe, address, city, sports, minage, maxage, lastdate, fees, prize, contact], function (errKuch) {

    if (errKuch == null)
      resp.send(" ✅ Record Saved Successfulllyyy....");

    else
      resp.send(" Not saved :" + errKuch.message);
  })


})



app.get("/do-fetch-all-users", function (req, resp) {
  console.log(req.query)

  mySqlVen.query("select * from tournaments where emailid=?", [req.query.email], function (_err, allRecords) {
    resp.send(allRecords);
  })
})

//=========================================================

app.get("/delete-one", function (req, resp) {
  //console.log(req.query)
  let rid = req.query.ridKuch;


  mySqlVen.query("delete from tournaments where rid=?", [rid], function (errKuch, result) {
    if (errKuch == null) {
      if (result.affectedRows == 1)
        resp.send(rid + " Deleted Successfulllyyyy...");
      else
        resp.send("Invalid Email id");
    }
    else
      resp.send(errKuch);

  })
})


//==================================================================
app.get("/do-admin-console", function (req, resp) {
  console.log(req.query);

  mySqlVen.query("select * from users", function (_err, allRecords) {
    resp.send(allRecords);
  })
})

//==================TOURNAMENTFINDER.HTML==========================


app.get("/do-show-all-tournaments", function (req, resp) {
  console.log(req.query);
  mySqlVen.query("select * from tournaments where city=? and sports=?", [req.query.kuchCity, req.query.kuchGame], function (_err, allRecords) {
    console.log(allRecords);
    resp.send(allRecords);
  })
})

//=====================ALL-REGISTED-ORGANIZER.HTML===============

app.get("/all-reg-org", function (req, resp) {
  console.log(req.query);

  mySqlVen.query("select * from organizers", function (_err, allRecords) {
    resp.send(allRecords);
  })
})

//=======================ALL-REGISTED-PLAYERS.HTML===============================

app.get("/all-reg-players", function (req, resp) {
  console.log(req.query);

  mySqlVen.query("select * from players", function (_err, allRecords) {
    resp.send(allRecords);
  })
})
//=========================================================================




//======================Generative Ai ==========================//

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyA5Tc05qrbyTuZZm8GjXM1VPNm3yz7hCMo"); // api key of gemini on ai studio //
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });



// ===================== To run Ai=========================================
async function RajeshBansalKaChirag(imgurl) {
  const myprompt = "Read the text on picture and tell all the information in adhaar card and give output STRICTLY in JSON format {adhaar_number:'', name:'', gender:'', dob: ''}. Dont give output as string."
  const imageResp = await fetch(imgurl)
    .then((response) => response.arrayBuffer());

  const result = await model.generateContent([
    {
      inlineData: {
        data: Buffer.from(imageResp).toString("base64"),
        mimeType: "image/jpeg",
      },
    },
    myprompt,
  ]);
  console.log(result.response.text())

  const cleaned = result.response.text().replace(/```json|```/g, '').trim();
  const jsonData = JSON.parse(cleaned);
  console.log(jsonData);

  return jsonData

}
// app.post("/player-details", async function (req, resp) {

//   let acardpicurl = "";
//   let profilepicurl = "";
//   let jsonData = [];



//   if (req.files != null) {
//     let fName = req.files.adhaarPic.name;
//     let locationToSave = __dirname + "/public/uploads/" + fName;//full ile path

//     await req.files.adhaarPic.mv(locationToSave);//saving file in uploads folder

//     //saving ur file/pic on cloudinary server
//     await cloudinary.uploader.upload(locationToSave).then(async function (picUrlResult) {
//       acardpicurl = picUrlResult.url;
//       console.log(acardpicurl);

//       let jsonData = await RajeshBansalKaChirag(acardpicurl); // call the function that we write on next to it 

//       resp.send(jsonData);
//     });
//   }
//   else
//     acardpicurl= "No pic.jpg";


//   try {

//     if (req.files != null) {
//       let fName = req.profilePic.name;
//       let locationToSave = __dirname + "/public/uploads/" + fName;
//       await req.files.profilePic.mv(locationToSave);

//       await cloudinary.uploader.upload(locationToSave).then(async function (picUrlResult) {
//         profilepicurl = picUrlResult.url;
//         console.log(profilepicurl);
//       });
//     }
//     else
//       profilepicurl = "no pic .jpg";
//   }
//   catch {
//     console.log("failed");
//   }

//   let emailid = req.body.txtEmail;
//   let name = jsonData.name;
//   let dob = jsonData.dob;
//   let gender = jsonData.gender;
//   let address = req.body.add;
//   let contact = req.body.contact;
//   let game = req.body.gamePlay;
//   let otherinfo = req.body.otherInfo;

//   console.log(req.body);

//   mySqlVen.query("insert into players values (?,?,?,?,?,?,?,?,?,?)", [emailid, null, null, name, dob, gender, address, contact, game, otherinfo], function (errKuch) {

//     if (errKuch == null)
//       resp.send(" ✅ Record Saved Successfulllyyy....");

//     else
//       resp.send(" Not saved :" + errKuch.message);
//   })

// })

app.post("/player-details", async function (req, resp) {
  try {
    let acardpicurl = "No pic.jpg";
    let profilepicurl = "no pic.jpg";
    let jsonData = {};

    // 1. Aadhaar picture upload
    if (req.files && req.files.adhaarPic) {
      let fName = req.files.adhaarPic.name;
      let locationToSave = __dirname + "/public/uploads/" + fName;
      await req.files.adhaarPic.mv(locationToSave);

      const result = await cloudinary.uploader.upload(locationToSave);
      acardpicurl = result.url;

      jsonData = await RajeshBansalKaChirag(acardpicurl); // assumes it returns {name, dob, gender}
    }

    // 2. Profile picture upload
    if (req.files && req.files.profilePic) {
      let fName = req.files.profilePic.name;
      let locationToSave = __dirname + "/public/uploads/" + fName;
      await req.files.profilePic.mv(locationToSave);

      const result = await cloudinary.uploader.upload(locationToSave);
      profilepicurl = result.url;
    }

    // 3. Insert into DB
    let emailid = req.body.txtEmail;
    let name = jsonData.name || "Unknown";
    let dob = jsonData.dob || "Unknown";
    let gender = jsonData.gender || "Unknown";
    let address = req.body.add;
    let contact = req.body.contact;
    let game = req.body.gamePlay;
    let otherinfo = req.body.otherInfo;

    console.log(req.body);

    mySqlVen.query(
      "INSERT INTO players VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [emailid, acardpicurl, profilepicurl, name, dob, gender, address, contact, game, otherinfo],
      function (errKuch) {
        if (errKuch == null)
          resp.send("✅ Record Saved Successfully.");
        else
          resp.send("❌ Not saved: " + errKuch.message);
      }
    );

  } catch (err) {
    console.error("Server error:", err);
    resp.status(500).send("❌ Server error occurred.");
  }
});


//=========================TOURNAMENTFINDER.HTML=====================//

app.get("/do-show-all-cities", function (req, resp) {
  console.log(req.query)

  mySqlVen.query("select distinct city  from tournaments ", function (_err, allRecords) {

    resp.send(allRecords);
  })

})
app.get("/do-show-all-sports", function (req, resp) {
  console.log(req.query)

  mySqlVen.query("select distinct sports  from tournaments ", function (_err, allRecords) {

    resp.send(allRecords);
  })

})

//=========================================================




app.post("/update-org", async function (req, resp) {
  let picurl = "";
  if (req.files != null)// user want to update profile pic
  {
    let fName = req.files.profilePic.name;
    let fullPath = __dirname + "/public/Uploads/" + fName;
    req.files.profilePic.mv(fullPath);
    //await req.files.profilePic.mv(locationToSave);

    await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
      picurl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server

      console.log(picurl);
    });
  }
  else
    picurl = req.body.hdn;
  console.log(picurl);

  //req.body.picName = fileName; // picName ke jagah kuch bhi name da sakta hai //

  let emailid = req.body.txtmail;
  console.log(emailid);
  let orgname = req.body.orgName;
  let regno = req.body.regNo;
  let address = req.body.add;
  let city = req.body.city;
  let sports = req.body.sport;
  let website = req.body.web;
  let insta = req.body.instaLink;
  let orghead = req.body.orgHead;
  let contact = req.body.contact;
  let otherinfo = req.body.otherInfo;
  

  mySqlVen.query("update organizers set orgname=?,regno=?,address=?,city=?,sports=?,website=?,insta=?,orghead=?,contact=?,otherinfo=?  where emailid= ?", [orgname, regno, address, city, sports, website, insta, orghead, contact, otherinfo, emailid], function (errKuch, result) {
    if (errKuch == null) {
      if (result.affectedRows == 1)
        resp.send("Your Data is Modified");

      else
        resp.send("invalid emailid")
    }
    else
      resp.send(JSON.stringify(errKuch.message))

  });


})



app.get("/do-update-all-users", function (req, resp) {
  //console.log("Requested Email:", email);
  //console.log("Old Password:", oldPass);
  // console.log("New Password:", newPass);

  // console.log(req.query)
  mySqlVen.query("update users set password=? where email=? and password=?", [req.query.kuchPassword2, req.query.kuchEmailid, req.query.kuchPassword1], function (err, allRecords) {
    if (err == null) {
      if (allRecords.affectedRows == 1)
        resp.send(" Update Password Successfulllyyyy...");
      else
        resp.send("Invalid Emailid");
    }
    else
      resp.send(err);

    //console.log(allRecords)
    //resp.send(allRecords);
  })
})




app.get("/do-fetch-all-users2", function (req, resp) {
  mySqlVen.query("select * from  users", function (err, allRecords) {
    resp.send(allRecords);
  })
})
app.get("/block-one", function (req, resp) {
  console.log(req.query)
  let email= req.query.emailidKuch;

  mySqlVen.query("update users set status=0 where email=? ", [email], function (errKuch, result) {
    if (errKuch == null) {
      if (result.affectedRows == 1)
        resp.send(email + " Blocked Successfulllyyyy...");
      else
        resp.send("email");
    }
    else
      resp.send(errKuch);

  })
})
app.get("/resume-one", function (req, resp) {
  console.log(req.query)
  let email = req.query.emailidKuch;

  mySqlVen.query("update users set status=1 where email=? ", [email], function (errKuch, result) {
    if (errKuch == null) {
      if (result.affectedRows == 1)
        resp.send(email + " Unblocked Successfulllyyyy...");
      else
        resp.send("email");
    }
    else
      resp.send(errKuch);

  })
})
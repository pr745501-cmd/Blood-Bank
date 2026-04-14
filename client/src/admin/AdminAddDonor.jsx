import { useState } from "react";
import axios from "axios";

const bloodColors = {
  "A+": "bg-red-500",
  "A-": "bg-red-400",
  "B+": "bg-blue-500",
  "B-": "bg-blue-400",
  "O+": "bg-green-500",
  "O-": "bg-green-400",
  "AB+": "bg-purple-500",
  "AB-": "bg-purple-400"
};

function AdminAddDonor() {

const [formData,setFormData] = useState({
name:"",
mobile:"",
email:"",
age:"",
gender:"",
bloodGroup:"",
address:""
});

const handleChange = (e)=>{
setFormData({
...formData,
[e.target.name]:e.target.value
});
};

const handleSubmit = async(e)=>{
e.preventDefault();

try{

const token = localStorage.getItem("token");

const res = await axios.post(
"http://localhost:5000/api/admin/add-donor",
formData,
{
headers:{Authorization:`Bearer ${token}`}
}
);

const creds = res.data.loginCredentials;
if (creds) {
  alert(`✅ Donor Added Successfully!\n\n🔐 Login Credentials:\nEmail: ${creds.email}\nPassword: ${creds.password}\n\nShare these with the donor.`);
} else {
  alert("Donor Added Successfully (no email provided — no login account created)");
}
setFormData({ name:"", mobile:"", email:"", age:"", gender:"", bloodGroup:"", address:"" });

}catch(error){
alert(error.response?.data?.message || "Failed to add donor");
}

};

const eligible = formData.age >= 18 && formData.age <= 65;

return(

<div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 p-8">

<h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
🩸 Add Blood Donor
</h1>

<div className="grid lg:grid-cols-3 gap-8">

{/* LEFT SIDE FORM */}

<div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg">

<form onSubmit={handleSubmit} className="space-y-6">

<div className="grid md:grid-cols-2 gap-6">

{/* NAME */}

<div>
<label className="font-semibold">Full Name</label>
<input
type="text"
name="name"
onChange={handleChange}
required
className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-red-400 outline-none"
/>
</div>

{/* MOBILE */}

<div>
<label className="font-semibold">Mobile</label>
<input
type="text"
name="mobile"
onChange={handleChange}
required
className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-red-400 outline-none"
/>
</div>

{/* EMAIL */}

<div>
<label className="font-semibold">Email</label>
<input
type="email"
name="email"
onChange={handleChange}
className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-red-400 outline-none"
/>
</div>

{/* AGE */}

<div>
<label className="font-semibold">Age</label>
<input
type="number"
name="age"
onChange={handleChange}
required
className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-red-400 outline-none"
/>
</div>

{/* GENDER */}

<div>
<label className="font-semibold">Gender</label>

<select
name="gender"
onChange={handleChange}
required
className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-red-400"
>

<option value="">Select</option>
<option>Male</option>
<option>Female</option>

</select>
</div>

{/* BLOOD GROUP */}

<div>
<label className="font-semibold">Blood Group</label>

<select
name="bloodGroup"
onChange={handleChange}
required
className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-red-400"
>

<option value="">Select</option>
<option>A+</option>
<option>A-</option>
<option>B+</option>
<option>B-</option>
<option>O+</option>
<option>O-</option>
<option>AB+</option>
<option>AB-</option>

</select>

{/* BLOOD BADGE */}

{formData.bloodGroup && (

<div className={`inline-block mt-2 px-3 py-1 text-white text-sm rounded-full ${bloodColors[formData.bloodGroup]}`}>

{formData.bloodGroup} Donor

</div>

)}

</div>

</div>

{/* ADDRESS */}

<div>
<label className="font-semibold">Address</label>

<textarea
name="address"
rows="3"
onChange={handleChange}
required
className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-red-400"
/>

</div>

{/* SUBMIT */}

<button
type="submit"
className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg shadow hover:scale-105 transition"
>

➕ Add Donor

</button>

</form>

</div>

{/* RIGHT SIDE PREVIEW PANEL */}

<div className="bg-white p-6 rounded-2xl shadow-lg">

<h3 className="font-semibold mb-4">
Live Donor Preview
</h3>

{/* AVATAR */}

<div className="flex flex-col items-center">

<div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-3xl">

👤

</div>

<h4 className="mt-3 font-semibold">
{formData.name || "Donor Name"}
</h4>

<p className="text-gray-500 text-sm">
{formData.mobile || "Mobile Number"}
</p>

</div>

{/* BLOOD BADGE */}

{formData.bloodGroup && (

<div className="mt-4 text-center">

<span className={`px-4 py-1 rounded-full text-white ${bloodColors[formData.bloodGroup]}`}>

{formData.bloodGroup}

</span>

</div>

)}

{/* HEALTH INDICATOR */}

<div className="mt-6">

<h4 className="font-semibold mb-2">
Eligibility Status
</h4>

{formData.age === "" ? (

<p className="text-gray-400">
Enter age to check eligibility
</p>

) : eligible ? (

<div className="text-green-600 font-semibold">
✔ Eligible to donate
</div>

) : (

<div className="text-red-500 font-semibold">
✖ Not eligible
</div>

)}

</div>

</div>

</div>

</div>

);

}

export default AdminAddDonor;
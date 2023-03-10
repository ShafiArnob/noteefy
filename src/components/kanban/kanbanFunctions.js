import { doc, getDoc, onSnapshot, updateDoc, writeBatch } from "firebase/firestore"
import { useEffect } from "react"
import { projectFirestore } from "../../firebase/config"

export const updateTask = async data =>{
  // const res = fetch(`http://localhost:8000/pages/${data.id}`, {
  //   method: 'PUT',
  //   headers: {
  //     'Content-type': 'application/json'
  //   },
  //   body: JSON.stringify(data)
  // })
  // .then(res=>res.json())

  // local server
  // const res = await axios.put(`http://localhost:8000/pages/${data.id}`,data)
  // const dataR = await res.json()

  
  const collRef = doc(projectFirestore,"pages",data.id)

  const res = await updateDoc(collRef, data)
  // console.log(res);
  // return res

  // console.log(data);
}

export const addPage = async (data, user) =>{
  // console.log(data, "-", user.uid);
  // await axios.post('http://localhost:8000/pages', data)
  
  const docRef = doc(projectFirestore,"users",user.uid)
  const docSnap = await getDoc(docRef)
  

  if(docSnap.exists()){
    const userData = {...docSnap.data()}
    const newData = {...userData, pages:[...userData.pages, data]} //user

    // await setDoc(doc(projectFirestore, "pages", data.id), data)
    const batch = writeBatch(projectFirestore)
    
    // Add page
    const pageRef = doc(projectFirestore, "pages", data.id)
    batch.set(pageRef, data)

    delete newData["kanban"]
    
    // Add page referance to users
    const userRef = doc(projectFirestore,"users",user.uid)
    batch.update(userRef, newData)

    await batch.commit()
  }
  else{
    console.log("No Such Document");
  }

}

export const delCol = async(colId, page) => {
  const proceed = confirm(`Do you want to delete this column??`)
  if(proceed){
    // console.log("col Id", colId);
    // console.log(page);
    const newcolData = page.kanban.filter(col => col.id !== colId)
    const newPageData = {...page, kanban:newcolData}
    // console.log(newPageData);
    const collRef = doc(projectFirestore,"pages",page.id)
    const res = await updateDoc(collRef, newPageData)
  }
}

export const delItem = async(itemId, colId, page) =>{

  const targetCol = page.kanban.find(col => col.id === colId) //get targeted column
  const targetColItemsWODelItem = targetCol.tasks.filter(item => item.id !==itemId) //removed item

  const newTargetedCol = {...targetCol, tasks:targetColItemsWODelItem} //new col with removed item
  const colsWOTargetCol = page.kanban.filter(col => col.id !== colId) // columns without targeted column

  
  const newColumns = [...colsWOTargetCol, newTargetedCol] // new all columns with removed items

  const newPage = {...page, kanban:newColumns} // new page

  // Update
  const collRef = doc(projectFirestore,"pages",page.id)
  const res = await updateDoc(collRef, newPage)
}

export const editCol = async(section, page) =>{
  const editTitle = prompt("Enter Column Title", section.title)

  if(editTitle !== page.title && editTitle){
    // const targetColData = page.kanban.find(col => col.id === section.id)
    const restColsData = page.kanban.filter(col => col.id !== section.id)
    const editedColData = {...section, title:editTitle}
    const newColsData = [...restColsData, editedColData]
    const newPageData = {...page, kanban:newColsData}
    
    //update
    const collRef = doc(projectFirestore,"pages",page.id)
    const res = await updateDoc(collRef, newPageData)
  }  
}

export const editItem = async(task, colId, page)=>{
  const editTitle = prompt("Enter Column Title", task.title)

  if(editTitle !== page.title && editTitle){
    const newEditedTask = {...task, title:editTitle}

    const targetCol = page.kanban.find(col => col.id === colId) //get targeted column
    const targetColItemsWODelItem = targetCol.tasks.filter(item => item.id !==task.id) //removed item
    const newColItems = [...targetColItemsWODelItem, newEditedTask] // added edited item
    const newTargetCol = {...targetCol, tasks:newColItems}

    const restCols = page.kanban.filter(doc=>doc.id !== colId) //rest of the cols without target cols
    const newCols = [...restCols, newTargetCol] // added new edited col to cols

    const newPage = {...page, kanban:newCols}
    
    // Update
  const collRef = doc(projectFirestore,"pages",page.id)
  const res = await updateDoc(collRef, newPage)
  }
}
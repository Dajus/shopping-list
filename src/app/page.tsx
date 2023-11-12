'use client';
import React, { useState } from 'react';

import Image from 'next/image'
import styles from './page.module.css'

export default function Home() {
  const [shoppingList, setShoppingList] = useState({
    name: 'Shopping List',
    description: 'A list of things to buy',
    items: [
      { name: 'Banány', quantity: 3 },
    ],
  });

  const [item, setItem] = useState({
    name: '',
    quantity: 0
  });

  const handleAddItem = (event: any) => {
    setItem({
      name: event.target.value,
      quantity: 0
    });
  }

  const handleAddQuantity = (event: any) => {
    setItem({
      name: item.name,
      quantity: event.target.value
    });
  }

  const handleSetItemToList = () => {
    setShoppingList({
      name: shoppingList.name,
      description: shoppingList.description,
      items: [...shoppingList.items, item]
    });
    setItem({ name: '', quantity: 0 });
  }



  console.log(shoppingList);
  return (
    <main className={styles.main}>
      <div>
        <h1 className={styles.title}>
          {shoppingList.name}
        </h1>
        <p className={styles.description}>
          {shoppingList.description}
        </p>
        <ul>
          {shoppingList.items.map((item) => (
            <li key={item.name}>
              {item.name} - {item.quantity}
            </li>
          ))}
        </ul>
        <div>
          <span>Jméno: </span>
          <input type="text" onChange={handleAddItem} value={item.name}/>
          <br/>
          <span>Počet: </span>
          <input type="number" onChange={handleAddQuantity} value={item.quantity}/>
          <br/>
          <span>Popisek: </span>
          <input type="number" onChange={handleAddQuantity} value={item.quantity}/>
        </div>
        <button onClick={handleSetItemToList}>add to list</button>
      </div>
    </main>
  )
}

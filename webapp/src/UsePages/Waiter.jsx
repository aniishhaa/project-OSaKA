import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import './Waiter.css';
import titleImage from '../Assets/Zen&Zest.png';

const Waiter = () => {
  const navigate = useNavigate();
  const items = [
    { id: 1, name: 'Item 1', price: 120 },
    { id: 2, name: 'Item 2', price: 150 },
    { id: 3, name: 'Item 3', price: 200 },
    { id: 4, name: 'Item 4', price: 180 },
    { id: 5, name: 'Item 5', price: 130 },
    { id: 6, name: 'Item 6', price: 140 },
    { id: 7, name: 'Item 7', price: 160 },
    { id: 8, name: 'Item 8', price: 170 },
    { id: 9, name: 'Item 9', price: 190 },
    { id: 10, name: 'Item 10', price: 110 },
  ];

  const [Qty, setQty] = useState(Array(items.length).fill(0));
  const [itemsSelected, setItemsSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [statusQueue, setStatusQueue] = useState([]);
  const [reloadFlag, setReloadFlag] = useState(false);

  function decrement(index) {
    if (Qty[index] <= 0) return;
    setQty(previousQty => {
      previousQty[index] -= 1;
      return previousQty;
    });
    setItemsSelected(oldSelectedItems => {
      const newSelectedItems = [...oldSelectedItems];
      const indexToBeDeleted = newSelectedItems.findIndex(cursor => cursor.name === items[index].name
        && cursor.quantity === (Qty[index] + 1)
        && cursor.price === items[index].price);
      newSelectedItems.splice(indexToBeDeleted, 1);
      if (Qty[index] === 0) return [...newSelectedItems];
      else return [...newSelectedItems, { name: items[index].name, quantity: Qty[index], price: items[index].price }];
    });
  }

  function increment(index) {
    setQty(previousQty => {
      previousQty[index] += 1;
      return previousQty;
    });
    setItemsSelected(oldSelectedItems => {
      const newSelectedItems = [...oldSelectedItems];
      if (Qty[index] === 1)
        return [...newSelectedItems, { name: items[index].name, quantity: Qty[index] }];
      else {
        const indexToBeDeleted = newSelectedItems.findIndex(cursor => cursor.name === items[index].name
          && cursor.quantity === (Qty[index] - 1)
          && cursor.price === items[index].price);
        newSelectedItems.splice(indexToBeDeleted, 1);
        return [...newSelectedItems, { name: items[index].name, quantity: Qty[index], price: items[index].price }];
      }
    });
  }

  function handleFinalize() {
    const totalPrice = [...itemsSelected].reduce((accummulator, curr) => accummulator + (curr.quantity * curr.price), 0);
    if (totalPrice <= 0) return alert("Please select items before finalizing order.");
    setShowModal(true);
  }

  async function submitOrder() {
    if (!customerName.trim()) return alert("Please enter a valid name.");

    try {
      const orderData = {
        name: customerName,
        items: itemsSelected.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice: itemsSelected.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0),
        status: "Pending"
      };
      console.log(orderData);
      // Send POST request to the backend API
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URI}/item`, { ...orderData });

      if (/^20\d$/.test(response.status.toString())) {
        setQty(Array(items.length).fill(0));
        setItemsSelected([]);
        setCustomerName('');
        setShowModal(false);
        alert("Order successfully placed!");
      }
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Failed to place order. Please try again.");
    }
  }

  async function getJobs() {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/items`);
      let tempQ = [...response.data].filter(data => data.status !== 'Delivered')
      setStatusQueue(tempQ);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  }

  useEffect(() => {
    getJobs();
  }, [itemsSelected, Qty, reloadFlag]);

  return (
    <div className="waiter-container">
  <nav className="navbar">
  <a className="navbar-brand" onClick={() => navigate('/')}>
    <img src={titleImage} width="300" height="80"/>
  </a>
</nav>

      <div className="content">
        {/* Left section - Items Menu */}
        <div className="left-side">
          <div className="menu">
            <h3>Menu</h3>
            <Button className="finalize" onClick={handleFinalize}>
              Finalize Order
            </Button>
            <div className="item-cards">
              {items.map((item, index) => (
                <Card className="item-card" key={item.id}>
                  <Card.Body>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>
                      <div>₹{item.price}</div>
                      <Button onClick={() => decrement(index)} variant="primary" size="sm">-</Button>
                      <span>{Qty[index]}</span>
                      <Button onClick={() => increment(index)} variant="secondary" size="sm">+</Button>
                    </Card.Text>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right section - Booked Orders */}
        <div className="right-side">
          <div className="finalized-orders">
            <h3>Booked Orders</h3>
            <table className="final-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Total Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {statusQueue.map(order => (
                  <tr key={order._id}>
                    <td>{order.name}</td>
                    <td>₹{order.totalPrice}</td>
                    <td>
                      <Button onClick={() => navigate(`/order/${order._id}`)}>{order.status}</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for customer details */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Customer Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Customer Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                autoFocus
              />
            </Form.Group>
          </Form>
          <div>
            <h5>Order Summary:</h5>
            <ul>
              {itemsSelected.map((item, idx) => (
                <li key={idx}>
                  {item.name} x {item.quantity} = ₹{item.quantity * item.price}
                </li>
              ))}
            </ul>
            <p><strong>Total: ₹{itemsSelected.reduce((acc, item) => acc + item.quantity * item.price, 0)}</strong></p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitOrder}>
            Place Order
          </Button>
        </Modal.Footer>
      </Modal>
    </div>

  );
};

export default Waiter;

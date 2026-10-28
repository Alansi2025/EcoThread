package com.ecothread.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private BeneficiaryOrder order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    @Column(nullable = false)
    private Integer creditPrice = 0;

    public OrderItem() {}

    public OrderItem(BeneficiaryOrder order, InventoryItem inventoryItem, Integer creditPrice) {
        this.order = order;
        this.inventoryItem = inventoryItem;
        this.creditPrice = creditPrice != null ? creditPrice : 0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BeneficiaryOrder getOrder() {
        return order;
    }

    public void setOrder(BeneficiaryOrder order) {
        this.order = order;
    }

    public InventoryItem getInventoryItem() {
        return inventoryItem;
    }

    public void setInventoryItem(InventoryItem inventoryItem) {
        this.inventoryItem = inventoryItem;
    }

    public Integer getCreditPrice() {
        return creditPrice;
    }

    public void setCreditPrice(Integer creditPrice) {
        this.creditPrice = creditPrice;
    }
}

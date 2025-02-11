package com.mosaicchurchaustin.oms.data.entity;

import com.mosaicchurchaustin.oms.services.audit.AuditLogListener;
import com.mosaicchurchaustin.oms.services.audit.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.SneakyThrows;
import lombok.ToString;
import org.hibernate.annotations.BatchSize;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "items")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EntityListeners(AuditLogListener.class)
public class ItemEntity extends BaseEntity implements Auditable {

    public static String ENTITY_TYPE = "Item";

    @Override
    public String getEntityType() {
        return ENTITY_TYPE;
    }

    @Setter
    @Column(name = "placeholder", nullable = false)
    String placeholder;

    @Column(name = "description", nullable = false)
    String description;

    @Setter
    @Enumerated(EnumType.STRING) // Save enum as its name
    @Column(name = "category")
    ItemCategory category;

    @Setter
    @Column(name = "removed", nullable = false)
    boolean removed;

    @Setter
    @Column(name = "is_suggested_item", nullable = false)
    Boolean isSuggestedItem;

    @BatchSize(size = 100)
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "itemEntity")
    @ToString.Exclude
    List<OrderItemEntity> orderItems;

    @Transient
    Map<String, String> previousState;

    @SneakyThrows
    @Override
    public Map<String, String> getCurrentState() {
        final Map<String, String> state = new HashMap<>();
        state.put("isSuggestedItem", String.format("%s", isSuggestedItem != null && isSuggestedItem));

        if (this.description != null) {
            state.put("description", description);
        }
        if (this.placeholder != null) {
            state.put("placeholder", placeholder);
        }
        if (this.category != null) {
            state.put("category", category.name());
        }
        return state;
    }

    @SneakyThrows
    @Override
    public void stashState() {
        previousState = getCurrentState();
    }
}

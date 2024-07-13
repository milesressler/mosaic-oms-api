package com.mosaicchurchaustin.oms.services;

import com.mosaicchurchaustin.oms.data.entity.ItemEntity;
import com.mosaicchurchaustin.oms.repositories.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemService {

    @Autowired
    ItemRepository itemRepository;

    public List<ItemEntity> getSuggestedItems() {
        return itemRepository.findAllByIsSuggestedItem(true);
    }

    public Page<ItemEntity> getPagedItems(final Pageable pageable) {
        return itemRepository.findAll(pageable);
    }
}

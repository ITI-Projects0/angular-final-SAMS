import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
})
export class Groups implements OnInit {

  isFormOpen = false;
  isEditMode = false;
  searchText = '';

  newGroup = {
    id: 0,
    name: '',
    category: '',
    description: '',
    members: 0,
    online: 0,
    img: ''
  };

  groupsList = [
    {
      id:1,
      name: 'Cuisine',
      category: 'Food',
      description: 'Food lovers group',
      members: 55,
      online: 22,
      img: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1170&q=80',
    },
    {
      id:2,
      name: 'Art',
      category: 'Drawing',
      description: 'Artists community',
      members: 132,
      online: 4,
      img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1171&q=80',
    }
  ];

  filteredGroups = [...this.groupsList];

  ngOnInit() {
    // ⭐ مهم جداً → يملأ LocalStorage بأول بيانات
    localStorage.setItem('groupsData', JSON.stringify(this.groupsList));
  }

  openForm(group?: any) {
    this.isFormOpen = true;
    if (group) {
      this.isEditMode = true;
      this.newGroup = { ...group };
    } else {
      this.isEditMode = false;
      this.newGroup = {
        id: this.groupsList.length + 1,
        name: '',
        category: '',
        description: '',
        members: 0,
        online: 0,
        img: ''
      };
    }
  }

  closeForm() {
    this.isFormOpen = false;
  }

  saveGroup() {
    if (this.isEditMode) {
      const index = this.groupsList.findIndex(g => g.id === this.newGroup.id);
      if (index !== -1) this.groupsList[index] = { ...this.newGroup };
    } else {
      this.newGroup.id = this.groupsList.length + 1;
      this.newGroup.img = 'https://via.placeholder.com/150';

      this.groupsList.push({
        ...this.newGroup,
        members: 1,
        online: 0
      });
    }

    // حفظ الداتا
    localStorage.setItem('groupsData', JSON.stringify(this.groupsList));
    this.filteredGroups = [...this.groupsList];
    this.closeForm();
  }

  deleteGroup(name: string) {
    this.groupsList = this.groupsList.filter(g => g.name !== name);
    this.filteredGroups = [...this.groupsList];

    // تحديث التخزين
    localStorage.setItem('groupsData', JSON.stringify(this.groupsList));
    this.closeForm();
  }

  search() {
    this.filteredGroups = this.groupsList.filter(g =>
      g.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      g.category.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}

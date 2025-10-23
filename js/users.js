class UserManager {
  constructor(tableId='usersTable', filtersId='userFilters'){
    this.table = document.getElementById(tableId);
    this.filters = document.getElementById(filtersId);
    this.page = 1; this.limit = 10; this.sort = 'created_at'; this.dir = 'desc';
    this.init();
  }
  init(){
    this.filters?.querySelector('[name="role"]')?.addEventListener('change', e => this.loadUsers({role:e.target.value, page:1}));
    this.filters?.querySelector('[name="search"]')?.addEventListener('input', debounce(e=>this.loadUsers({q:e.target.value, page:1}),300));
    this.loadUsers();
  }
  async loadUsers(params = {}){
    const sp = new URLSearchParams({ page: this.page, limit: this.limit, sort: this.sort, dir: this.dir, ...params });
    try {
      const res = await fetch('/api/users?' + sp.toString());
      const data = await res.json();
      this.renderUsers(data);
    } catch (e) {
      console.error('loadUsers', e);
    }
  }
  renderUsers({users = [], pagination = {}}){
    if (!this.table) return;
    const rows = users.map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${new Date(u.created_at*1000).toLocaleString()}</td></tr>`).join('');
    this.table.querySelector('tbody').innerHTML = rows;
    this.renderPagination(pagination);
  }
  renderPagination({total=0,page=1,pages=1}){
    let pager = document.querySelector('#usersPager');
    if (!pager) { pager = document.createElement('div'); pager.id='usersPager'; pager.className='pagination'; this.table.after(pager); }
    pager.innerHTML = pages>1 ? `<button ${page===1?'disabled':''} id="prev">Prev</button><span> Page ${page} / ${pages} </span><button ${page===pages?'disabled':''} id="next">Next</button>` : '';
    pager.querySelector('#prev')?.addEventListener('click', ()=>{ this.page = Math.max(1,page-1); this.loadUsers({page:this.page});});
    pager.querySelector('#next')?.addEventListener('click', ()=>{ this.page = Math.min(pages,page+1); this.loadUsers({page:this.page});});
  }
}
function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t = setTimeout(()=>fn.apply(this,a), ms); }; }
document.addEventListener('DOMContentLoaded', ()=>{ window.userManager = new UserManager(); });

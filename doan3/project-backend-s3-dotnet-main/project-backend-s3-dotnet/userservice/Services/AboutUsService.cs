using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using userservice.Modes;
using Microsoft.EntityFrameworkCore;
using userservice.Data;

namespace userservice.Services
{
    public class AboutUsService : IAboutUsService
    {
        private readonly APIContext _context;

        public AboutUsService(APIContext context)
        {
            _context = context;
        }

        public async Task<List<AboutUs>> GetAllAsync()
        {
            return await _context.AboutUs.ToListAsync();
        }

        public async Task<AboutUs> GetByIdAsync(int id)
        {
            return await _context.AboutUs.FirstOrDefaultAsync(a => a.AboutId == id);
        }

        public async Task<AboutUs> CreateAsync(AboutUs aboutUs)
        {
             aboutUs.PublishedDate = DateTime.Now;
            _context.AboutUs.Add(aboutUs);
            await _context.SaveChangesAsync();
            return aboutUs;
        }

        public async Task<AboutUs> UpdateAsync(int id, AboutUs aboutUs)
        {
            var existing = await _context.AboutUs.FirstOrDefaultAsync(a => a.AboutId == id);
            if (existing == null) return null;

            existing.FullName = aboutUs.FullName;
            existing.ImageUrl = aboutUs.ImageUrl;
            existing.Role = aboutUs.Role;
            existing.Description = aboutUs.Description;
            existing.UpdatedDate = DateTime.Now;
            
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var aboutUs = await _context.AboutUs.FirstOrDefaultAsync(a => a.AboutId == id);
            if (aboutUs == null) return false;

            _context.AboutUs.Remove(aboutUs);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

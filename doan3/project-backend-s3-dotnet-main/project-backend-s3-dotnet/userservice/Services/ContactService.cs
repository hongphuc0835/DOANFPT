using userservice.Modes;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using userservice.Data;

namespace userservice.Services
{
    public class ContactService : IContactService
    {
        private readonly APIContext _context;

        public ContactService(APIContext context)
        {
            _context = context;
        }

        public async Task<List<Contact>> GetAllAsync()
        {
            return await _context.Contacts.ToListAsync();
        }

        public async Task<Contact> GetByIdAsync(int id)
        {
            return await _context.Contacts.FirstOrDefaultAsync(c => c.ContactId == id);
        }

        public async Task<Contact> CreateAsync(Contact contact)
        {
             contact.PublishedDate = DateTime.Now;
            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();
            return contact;
        }

        public async Task<Contact> UpdateAsync(int id, Contact contact)
        {
            var existingContact = await _context.Contacts.FirstOrDefaultAsync(c => c.ContactId == id);
            if (existingContact == null)
            {
                return null;
            }

            existingContact.CompanyName = contact.CompanyName;
            existingContact.Email = contact.Email;
            existingContact.Address = contact.Address;
            existingContact.PhoneNumber = contact.PhoneNumber;
            existingContact.UpdatedDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return existingContact;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var contact = await _context.Contacts.FirstOrDefaultAsync(c => c.ContactId == id);
            if (contact == null)
            {
                return false;
            }

            _context.Contacts.Remove(contact);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

using userservice.Data;
using userservice.Modes;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using userservice.Services;

namespace userservice.Controllers

{
    [Route("api/contact")]
    [ApiController]
    public class ContactsController : ControllerBase
    {
        private readonly IContactService _contactService;

        public ContactsController(IContactService contactService)
        {
            _contactService = contactService;
        }

        [HttpGet]
         public async Task<ActionResult<IEnumerable<Contact>>> GetAllContact()
         {
            var contacts = await _contactService.GetAllAsync();
            return Ok(contacts);
         }

         [HttpGet("{id}")]
         public async Task<ActionResult<Contact>> GetByIdContact(int id)
         {
            var contact = await _contactService.GetByIdAsync(id);
            if (contact == null) return NotFound();

            return Ok(contact);
         }


         [HttpPost]
         public async Task<ActionResult<Contact>> CreateContact([FromBody] Contact contact)
         {
            if (contact == null) return BadRequest("invalid data");
            var createdContact = await _contactService.CreateAsync(contact);
             return CreatedAtAction(nameof(GetByIdContact), new { id = createdContact.ContactId }, createdContact);
         }

         [HttpPut("{id}")]
        public async Task<IActionResult> Updatecontact(int id, [FromBody] Contact contact)
        {
            if (id != contact.ContactId)
            {
                return BadRequest("ID mismatch.");
            }

            var updatedContact = await _contactService.UpdateAsync(id, contact);
            if (updatedContact == null)
            {
                return NotFound();
            }

            return Ok(new { Message = "update thành công" });
        }

        // DELETE: api/Contact/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContact(int id)
        {
            var isDeleted = await _contactService.DeleteAsync(id);
            if (!isDeleted)
            {
                return NotFound();
            }
           return Ok(new { Message = "xóa thành công" });
        }
    }
}
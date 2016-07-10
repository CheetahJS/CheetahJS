
These are the files you need to use Cheetah in your web app. You need either the minified version or non-minified version. Cheetah.ux.js is (may be) needed for tables (see note below):

Cheetah has custom elements that are inserted into your HTML (template), e.g.:

  <ch-if test="NumPersons != 0">
    ...
  </ch-if>
  
  In most cases this works just fine. In one particular case there is an issue:
  
  <table>
    <ch-bind on="Customers">
      <tr>
        <td>//Name//</td>
      </tr>
    </ch-bind>
  </table>
  
  In this example the browser will not recognize "ch-bind" as a valid child element of "table" and it will "push" the "ch-bind" element out of the table. The affected elements that will do this are "table", "thead" , "tbody", "tfoot" and "tr". To get around this you can do one of two things:
  
    1) Use divs with css table styling, i.e.
    
         .div.table:               { display: table }         
         .div.table > div:         { display: table-row }
         .div.table > div > div:   { display: table-cell }
         
          <div class="table">
            <ch-bind on="Customers">
              <div>
                <div>//Name//</div>
              </div>
            </ch-bind>
          </div>

    2) Use the included transforms for table elements (Cheetah.ux.js). 
    
        <cx-table>
          <ch-bind on="Customers">
            <cx-tr>
              <cx-td>//Name//</cx-td>
            </cx-tr>
          </ch-bind>
        </cx-table>
       
       Note that this file is not built into the main Cheetah.js file and must be included in your web page separately.
         
  In both of these cases there is no issue with Cheetah's elements. Also note that if there are no Cheetah elements within the affected table elements than those elements can be used with no side-effects.
         
    

import { Modifiers } from '../modifiers';
import { PropertyModifier } from '../../interfaces';
import { Model } from '../../model';

class HiddenTest extends Model {
    @Modifiers([PropertyModifier.hidden])
    hiddenProp!: string;
}

describe('common:decorators:modifiers', () => {
    it('should hide a property', () => {

        const propertyIsHidden = (model: Model, property: string) => {
            const json = JSON.parse(JSON.stringify(model));
            expect(instance[property]).toBeDefined();
            expect(json[property]).not.toBeDefined();
        };

        // Value should be able to be initialized with a default value
        const instance = new HiddenTest({ hiddenProp: 'secret' });
        propertyIsHidden(instance, 'hiddenProp');

        // Value should be able to be updated after constructor is called
        instance.hiddenProp = 'test';
        propertyIsHidden(instance, 'hiddenProp');
    });

});